import { Response, NextFunction } from 'express';
import { uploadService, UploadService } from './upload.service';
import { uploadRepository } from './upload.repository';
import { AuthenticatedRequest } from '../../common/middleware/auth';
import { FileType } from '../../infrastructure/postgres/models/file.model';
import { ValidationError } from '../../common/errors/app-error';

export class UploadController {
  constructor(private readonly service: UploadService = uploadService) {}

  public upload = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw new ValidationError('File is required in request payload (field name: "file")');
      }

      const { title, description, tags } = req.body;
      let uploadType = req.body.uploadType || req.body.fileType;

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

      // Parse tags if sent as stringified JSON or comma-separated string in multipart form-data
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

  public uploadBatch = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        // Fallback if client sent a single file as req.file
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
