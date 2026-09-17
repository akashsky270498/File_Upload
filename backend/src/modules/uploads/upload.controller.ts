import { Response, NextFunction } from 'express';
import { uploadService, UploadService } from './upload.service';
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

      const { uploadType, title, description, tags } = req.body;

      if (!uploadType) {
        throw new ValidationError(
          `uploadType is required. Allowed values: ${Object.values(FileType).join(', ')}`
        );
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
}

export const uploadController = new UploadController();
