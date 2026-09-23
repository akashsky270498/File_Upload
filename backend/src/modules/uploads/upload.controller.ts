// ==========================================
// 🕹️ UPLOAD CONTROLLER (HTTP Route Handler)
// ==========================================
// Ye controller Single / Batch File Uploads, View Counter Increments, aur File Deletions handle karta hai.

import { Response, NextFunction } from 'express';
import { uploadService, UploadService } from './upload.service';
import { uploadRepository } from './upload.repository';
import { AuthenticatedRequest } from '../../common/middleware/auth';
import { FileType } from '../../infrastructure/postgres/models/file.model';
import { ValidationError } from '../../common/errors/app-error';

export class UploadController {
  constructor(private readonly service: UploadService = uploadService) {}

  /**
   * 1. Single File Upload Handler (POST /api/v1/uploads/single)
   */
  public upload = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw new ValidationError('File is required in request payload (field name: "file")');
      }

      const { title, description, tags } = req.body;
      let uploadType = req.body.uploadType || req.body.fileType;

      // Auto-detect File Type from MIME type if not explicitly provided
      if (!uploadType && req.file) {
        const mime = req.file.mimetype.toLowerCase();
        if (mime.startsWith('image/')) {
          uploadType = FileType.POST_MEDIA;
        } else if (mime.startsWith('video/')) {
          uploadType = FileType.VIDEO;
        } else if (mime.startsWith('audio/')) {
          uploadType = FileType.AUDIO;
        } else {
          uploadType = FileType.DOCUMENT;
        }
      }

      // Stringified JSON ya comma-separated tags parse karne ka helper
      let parsedTags: string[] = [];
      if (tags) {
        if (typeof tags === 'string') {
          try {
            parsedTags = JSON.parse(tags);
          } catch {
            parsedTags = tags.split(',').map((t) => t.trim());
          }
        } else if (Array.isArray(tags)) {
          parsedTags = tags;
        }
      }

      const result = await this.service.uploadMedia(req.user!.userId, req.file, {
        uploadType: uploadType as FileType,
        title,
        description,
        tags: parsedTags,
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * 2. Multiple / Batch Files Upload Handler (POST /api/v1/uploads/batch) - Max 5 files
   */
  public uploadBatch = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        if (req.file) {
          return this.upload(req, res, next);
        }
        throw new ValidationError('At least one file is required in request payload (field name: "files")');
      }

      if (files.length > 5) {
        throw new ValidationError('Maximum 5 files can be uploaded at a time');
      }

      const { title, description, tags } = req.body;
      let parsedTags: string[] = [];
      if (tags) {
        if (typeof tags === 'string') {
          try {
            parsedTags = JSON.parse(tags);
          } catch {
            parsedTags = tags.split(',').map((t) => t.trim());
          }
        } else if (Array.isArray(tags)) {
          parsedTags = tags;
        }
      }

      const results = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        let uploadType = req.body.uploadType || req.body.fileType;

        if (!uploadType) {
          const mime = file.mimetype.toLowerCase();
          if (mime.startsWith('image/')) {
            uploadType = FileType.POST_MEDIA;
          } else if (mime.startsWith('video/')) {
            uploadType = FileType.VIDEO;
          } else if (mime.startsWith('audio/')) {
            uploadType = FileType.AUDIO;
          } else {
            uploadType = FileType.DOCUMENT;
          }
        }

        const fileTitle = files.length > 1
          ? `${title || file.originalname.split('.')[0]} (${i + 1})`
          : (title || file.originalname.split('.')[0]);

        const result = await this.service.uploadMedia(req.user!.userId, file, {
          uploadType: uploadType as FileType,
          title: fileTitle,
          description,
          tags: parsedTags,
        });
        results.push(result);
      }

      res.status(201).json({
        success: true,
        data: results,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * 3. Increment File View Counter Handler (POST /api/v1/uploads/:id/view)
   */
  public incrementView = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const file = await uploadRepository.findByIdAndIncrementView(id);
      res.status(200).json({
        success: true,
        data: {
          id: file.id,
          viewsCount: Number(file.viewsCount) || 0,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * 4. Delete File Handler (DELETE /api/v1/uploads/:id)
   */
  public delete = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.service.deleteMedia(id, req.user!.userId, req.user!.role);
      res.status(200).json({
        success: true,
        message: 'File deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  };
}

export const uploadController = new UploadController();

