// ==========================================
// 📁 UPLOAD SERVICE (File Processing Pipeline)
// ==========================================
// Ye service File Upload, Cloudinary Stream, DB Transaction, RabbitMQ Queue, Kafka Event,
// Elasticsearch Indexing, Notifications aur Real-time Socket.IO sync handle karti hai.

import { FileType } from '../../infrastructure/postgres/models/file.model';
import { User } from '../../infrastructure/postgres/models/user.model';
import { NotificationType } from '../../infrastructure/postgres/models/notification.model';
import { UploadStrategyFactory } from './upload.strategy';
import { uploadRepository, UploadRepository } from './upload.repository';
import { cloudinaryService, CloudinaryService, CloudinaryUploadResult } from '../../config/cloudinary';
import { UploadInputDTO, UploadResponseDTO } from './upload.interface';
import { ValidationError, AppError } from '../../common/errors/app-error';
import { logger } from '../../common/logger';
import { rabbitMQProducer } from '../../infrastructure/rabbitmq/rabbitmq.producer';
import { kafkaProducerService } from '../../infrastructure/kafka/kafka.producer';
import { esIndexManager } from '../../infrastructure/elasticsearch/index.manager';
import { notificationService } from '../notifications/notification.service';
import { socketGateway } from '../notifications/socket.gateway';

export class UploadService {
  constructor(
    private readonly repository: UploadRepository = uploadRepository,
    private readonly cloudinary: CloudinaryService = cloudinaryService
  ) {}

  /**
   * Main File Upload Pipeline (Cloudinary + PostgreSQL + Elasticsearch + Queues + Socket.io)
   */
  public async uploadMedia(
    userId: string,
    file: Express.Multer.File,
    dto: UploadInputDTO
  ): Promise<UploadResponseDTO> {
    if (!file) {
      throw new ValidationError('File is required for upload');
    }

    // 1. Strategy Pattern se file validation (MIME type & size check)
    const strategy = UploadStrategyFactory.getStrategy(dto.uploadType);
    strategy.validate(file);

    const title = dto.title || file.originalname.split('.')[0] || 'Untitled File';
    let cloudinaryResult: CloudinaryUploadResult | null = null;

    try {
      // 2. Cloudinary Cloud Storage Stream Upload
      cloudinaryResult = await this.cloudinary.uploadStream(
        file.buffer,
        strategy.cloudinaryFolder,
        strategy.resourceType
      );

      logger.info(
        { userId, publicId: cloudinaryResult.public_id, uploadType: dto.uploadType },
        'Cloudinary stream upload successful. Saving metadata to PostgreSQL...'
      );

      // 3. PostgreSQL Database Transaction me Metadata & Tags save karte hain
      const { file: fileRecord, tagNames } = await this.repository.createFileRecord({
        userId,
        originalName: file.originalname,
        title,
        description: dto.description,
        fileType: dto.uploadType,
        mimeType: file.mimetype,
        size: file.size,
        cloudinaryUrl: cloudinaryResult.secure_url,
        cloudinaryPublicId: cloudinaryResult.public_id,
        tags: dto.tags,
      });

      logger.info(
        { fileId: fileRecord.id, userId },
        'File record and tags saved successfully in PostgreSQL.'
      );

      // 4. Video/Audio hone par RabbitMQ Queue me Thumbnail Generation Job bhejte hain
      if (dto.uploadType === FileType.VIDEO || dto.uploadType === FileType.AUDIO) {
        await rabbitMQProducer.publishMediaJob('generate-thumbnail', {
          fileId: fileRecord.id,
          cloudinaryPublicId: fileRecord.cloudinaryPublicId,
          fileType: dto.uploadType,
        });
      }

      // 5. Kafka Event Bus me MEDIA_UPLOADED event publish karte hain
      await kafkaProducerService.publishMediaEvent('MEDIA_UPLOADED', fileRecord.id, {
        userId,
        fileType: fileRecord.fileType,
        cloudinaryUrl: fileRecord.cloudinaryUrl,
      });

      // 6. Fast Search Engine (Elasticsearch) me file record document Index karte hain
      await esIndexManager.indexFile({
        id: fileRecord.id,
        userId: fileRecord.userId,
        title: fileRecord.title,
        description: fileRecord.description || undefined,
        fileType: fileRecord.fileType,
        mimeType: fileRecord.mimeType,
        size: Number(fileRecord.size),
        cloudinaryUrl: fileRecord.cloudinaryUrl,
        tags: tagNames,
        viewsCount: 0,
        createdAt: new Date().toISOString(),
      });

      // 7. Uploader Details query karte hain Instant UI display ke liye
      const userRecord = await User.findByPk(userId, {
        attributes: ['id', 'firstName', 'lastName', 'email', 'profileImage'],
      });

      const uploader = userRecord
        ? {
            id: userRecord.id,
            firstName: userRecord.firstName,
            lastName: userRecord.lastName,
            email: userRecord.email,
            profileImage: userRecord.profileImage,
          }
        : undefined;

      const uploaderName = userRecord ? `${userRecord.firstName} ${userRecord.lastName}`.trim() : 'System';

      const responseDto: UploadResponseDTO = {
        id: fileRecord.id,
        userId: fileRecord.userId,
        originalName: fileRecord.originalName,
        title: fileRecord.title,
        description: fileRecord.description || undefined,
        fileType: fileRecord.fileType,
        mimeType: fileRecord.mimeType,
        size: Number(fileRecord.size),
        cloudinaryUrl: fileRecord.cloudinaryUrl,
        cloudinaryPublicId: fileRecord.cloudinaryPublicId,
        tags: tagNames,
        createdAt: fileRecord.createdAt,
        user: uploader,
      };

      // 8. Notification Service ke through User Notification DB entry create karte hain
      try {
        await notificationService.createAndSendNotification({
          userId,
          title: 'Media Asset Published',
          message: `Your asset "${fileRecord.title}" has been published successfully.`,
          type: NotificationType.FILE_UPLOADED,
        });
      } catch (notifErr) {
        logger.error({ notifErr }, 'Failed to trigger upload notification');
      }

      // 9. Real-time WebSockets (Socket.IO) broadcast (Sabhi active logged-in users ko instant update milta hai)
      try {
        socketGateway.broadcast('file:uploaded', {
          ...responseDto,
          uploaderName,
        });
      } catch (broadcastErr) {
        logger.error({ broadcastErr }, 'Failed to broadcast file:uploaded socket event');
      }

      return responseDto;
    } catch (error) {
      // COMPENSATING TRANSACTION: DB Failure hone par Cloudinary se asset auto-delete (rollback) kar dete hain
      if (cloudinaryResult?.public_id) {
        logger.error(
          { publicId: cloudinaryResult.public_id, error },
          'PostgreSQL transaction failed after Cloudinary upload. Triggering Cloudinary deletion compensating transaction...'
        );

        try {
          await this.cloudinary.deleteAsset(cloudinaryResult.public_id, strategy.resourceType);
          logger.info(
            { publicId: cloudinaryResult.public_id },
            'Compensating transaction successful: Orphaned Cloudinary asset removed.'
          );
        } catch (cleanupErr) {
          logger.error(
            { publicId: cloudinaryResult.public_id, cleanupErr },
            'CRITICAL: Cloudinary deletion compensating transaction failed! Enqueuing to RabbitMQ cleanup.queue...'
          );
          // Cleanup fail hone par RabbitMQ cleanup worker ko handoff kar dete hain
          await rabbitMQProducer.publishCleanupJob('cleanup-cloudinary-file', {
            publicId: cloudinaryResult.public_id,
            resourceType: strategy.resourceType,
          });
        }
      }

      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        `Upload processing failed: ${(error as Error).message}`,
        500,
        'UPLOAD_PROCESSING_ERROR'
      );
    }
  }

  /**
   * Delete Media Asset (PostgreSQL, Cloudinary, Elasticsearch, Socket sync)
   */
  public async deleteMedia(id: string, userId: string, userRole: string): Promise<void> {
    const isAdmin = userRole === 'ADMIN';
    const deletedFile = await this.repository.deleteFileRecord(id, userId, isAdmin);

    // 1. Cloudinary storage se file remove karte hain
    if (deletedFile.cloudinaryPublicId) {
      try {
        const strategy = UploadStrategyFactory.getStrategy(deletedFile.fileType);
        await this.cloudinary.deleteAsset(deletedFile.cloudinaryPublicId, strategy.resourceType);
      } catch (err) {
        logger.error({ fileId: id, publicId: deletedFile.cloudinaryPublicId, err }, 'Failed to delete asset from Cloudinary');
      }
    }

    // 2. Elasticsearch Index se remove karte hain
    try {
      await esIndexManager.deleteFile(id);
    } catch (err) {
      logger.error({ fileId: id, err }, 'Failed to delete file from Elasticsearch index');
    }

    // 3. Kafka event emit karte hain
    try {
      await kafkaProducerService.publishMediaEvent('MEDIA_DELETED', id, { userId });
    } catch (err) {
      logger.error({ fileId: id, err }, 'Failed to publish MEDIA_DELETED Kafka event');
    }

    // 4. Socket.io WebSocket broadcast (Frontend UI se instant file row remove hoti hai)
    try {
      socketGateway.broadcast('file:deleted', { id, fileId: id });
    } catch (broadcastErr) {
      logger.error({ broadcastErr, fileId: id }, 'Failed to broadcast file:deleted socket event');
    }
  }
}

export const uploadService = new UploadService();

