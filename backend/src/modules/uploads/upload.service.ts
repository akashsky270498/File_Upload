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
   * Process unified media upload with strategy validation, background jobs, and Cloudinary compensating transactions
   */
  public async uploadMedia(
    userId: string,
    file: Express.Multer.File,
    dto: UploadInputDTO
  ): Promise<UploadResponseDTO> {
    if (!file) {
      throw new ValidationError('File is required for upload');
    }

    // 1. Select Strategy & Validate file
    const strategy = UploadStrategyFactory.getStrategy(dto.uploadType);
    strategy.validate(file);

    const title = dto.title || file.originalname.split('.')[0] || 'Untitled File';
    let cloudinaryResult: CloudinaryUploadResult | null = null;

    try {
      // 2. Upload file stream to Cloudinary
      cloudinaryResult = await this.cloudinary.uploadStream(
        file.buffer,
        strategy.cloudinaryFolder,
        strategy.resourceType
      );

      logger.info(
        { userId, publicId: cloudinaryResult.public_id, uploadType: dto.uploadType },
        'Cloudinary stream upload successful. Saving metadata to PostgreSQL...'
      );

      // 3. Save metadata to PostgreSQL using DB transaction
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

      // 4. Publish background media processing job to RabbitMQ media.queue if video/audio
      if (dto.uploadType === FileType.VIDEO || dto.uploadType === FileType.AUDIO) {
        await rabbitMQProducer.publishMediaJob('generate-thumbnail', {
          fileId: fileRecord.id,
          cloudinaryPublicId: fileRecord.cloudinaryPublicId,
          fileType: dto.uploadType,
        });
      }

      // 5. Publish Domain Event to Kafka omnimedia.media.events
      await kafkaProducerService.publishMediaEvent('MEDIA_UPLOADED', fileRecord.id, {
        userId,
        fileType: fileRecord.fileType,
        cloudinaryUrl: fileRecord.cloudinaryUrl,
      });

      // 6. Index document into Elasticsearch
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

      // 7. Fetch uploader user details for instant UI metadata rendering
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

      // 8. Save Notification record to PostgreSQL DB and push real-time Socket.IO notification to uploader
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

      // 9. Broadcast real-time live feed update to ALL connected users
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
      // 5. COMPENSATING TRANSACTION: If PostgreSQL database save fails, clean up Cloudinary asset
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
          // Enqueue to RabbitMQ cleanup.queue for async retry by Cleanup Worker
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
   * Delete media asset from PostgreSQL DB, Cloudinary, and Elasticsearch
   */
  public async deleteMedia(id: string, userId: string, userRole: string): Promise<void> {
    const isAdmin = userRole === 'ADMIN';
    const deletedFile = await this.repository.deleteFileRecord(id, userId, isAdmin);

    // Delete Cloudinary asset if public ID is present
    if (deletedFile.cloudinaryPublicId) {
      try {
        const strategy = UploadStrategyFactory.getStrategy(deletedFile.fileType);
        await this.cloudinary.deleteAsset(deletedFile.cloudinaryPublicId, strategy.resourceType);
      } catch (err) {
        logger.error({ fileId: id, publicId: deletedFile.cloudinaryPublicId, err }, 'Failed to delete asset from Cloudinary');
      }
    }

    // Remove document from Elasticsearch index
    try {
      await esIndexManager.deleteFile(id);
    } catch (err) {
      logger.error({ fileId: id, err }, 'Failed to delete file from Elasticsearch index');
    }

    // Publish Kafka event
    try {
      await kafkaProducerService.publishMediaEvent('MEDIA_DELETED', id, { userId });
    } catch (err) {
      logger.error({ fileId: id, err }, 'Failed to publish MEDIA_DELETED Kafka event');
    }

    // Broadcast real-time deletion event to ALL connected socket clients
    try {
      socketGateway.broadcast('file:deleted', { id, fileId: id });
    } catch (broadcastErr) {
      logger.error({ broadcastErr, fileId: id }, 'Failed to broadcast file:deleted socket event');
    }
  }
}

export const uploadService = new UploadService();
