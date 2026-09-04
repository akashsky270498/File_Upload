import { Response, NextFunction } from 'express';
import { fileService } from './files.service';
import { sendResponse } from '../../common/utils/apiResponse';
import { AuthenticatedRequest } from '../../common/types/authenticatedRequest.interface';
import { BadRequestError } from '../../common/errors/customErrors';

export class FileController {
  public uploadFile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw new BadRequestError('Please provide a file to upload.');
      }

      const userId = req.user?.userId;
      if (!userId) {
        throw new BadRequestError('User authentication required.');
      }

      const body = req.body as { title?: string; description?: string; tags?: string | string[] };
      const title = body.title || req.file.originalname;
      const description = body.description || '';
      let tags: string[] = [];

      if (body.tags) {
        if (typeof body.tags === 'string') {
          try {
            const parsed = JSON.parse(body.tags);
            tags = Array.isArray(parsed) ? parsed : body.tags.split(',').map((t: string) => t.trim());
          } catch {
            tags = body.tags.split(',').map((t: string) => t.trim());
          }
        } else if (Array.isArray(body.tags)) {
          tags = body.tags;
        }
      }

      const file = await fileService.uploadFile({
        file: req.file,
        title,
        description,
        tags,
        uploaderId: userId,
      });

      sendResponse(res, 201, 'Multimedia file uploaded successfully.', file);
    } catch (error) {
      next(error);
    }
  };

  public searchFiles = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { query, fileType, sortBy, sortOrder, page, limit, tags } = req.query;

      const result = await fileService.searchFiles({
        query: query ? String(query) : undefined,
        fileType: fileType ? String(fileType) : undefined,
        sortBy: sortBy as 'relevance' | 'views' | 'date' | 'size' | undefined,
        sortOrder: sortOrder as 'asc' | 'desc' | undefined,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 12,
        tags: tags ? (Array.isArray(tags) ? (tags as string[]) : String(tags)) : undefined,
      });

      sendResponse(res, 200, 'Files retrieved successfully.', result.files, result.meta);
    } catch (error) {
      next(error);
    }
  };

  public getFileById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const file = await fileService.getFileById(id);
      sendResponse(res, 200, 'File details retrieved successfully.', file);
    } catch (error) {
      next(error);
    }
  };

  public deleteFile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        throw new BadRequestError('User authentication required.');
      }

      await fileService.deleteFile(id, userId);
      sendResponse(res, 200, 'Multimedia file deleted successfully.');
    } catch (error) {
      next(error);
    }
  };
}

export const fileController = new FileController();
