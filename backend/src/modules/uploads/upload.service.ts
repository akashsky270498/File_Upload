import { FileType } from '../../infrastructure/postgres/models/file.model';
import { UploadStrategyFactory } from './upload.strategy';
import { uploadRepository, UploadRepository } from './upload.repository';
import { cloudinaryService, CloudinaryService, CloudinaryUploadResult } from '../../config/cloudinary';
import { UploadInputDTO, UploadResponseDTO } from './upload.interface';
import { ValidationError, AppError } from '../../common/errors/app-error';
import { logger } from '../../common/logger';
import { rabbitMQProducer } from '../../infrastructure/rabbitmq/rabbitmq.producer';
import { kafkaProducerService } from '../../infrastructure/kafka/kafka.producer';
import { esIndexManager } from '../../infrastructure/elasticsearch/index.manager';

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
        createdAt: new Date().toISOString(),
      });

      return {
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
      };
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
}

export const uploadService = new UploadService();
