import { Request, Response, NextFunction } from 'express';
import { searchService, SearchService } from './search.service';

export class SearchController {
  constructor(private readonly service: SearchService = searchService) {}

  /**
   * GET /api/v1/search
   */
  public search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = (req.body.q || req.query.q) as string | undefined;
      const fileType = (req.body.fileType || req.query.fileType) as string | undefined;
      const rawTags = req.body.tags || req.query.tags;
      const tags = Array.isArray(rawTags)
        ? rawTags
        : typeof rawTags === 'string'
        ? rawTags.split(',')
        : undefined;
      const sortBy = (req.body.sortBy || req.query.sortBy) as any;
      const sortOrder = (req.body.sortOrder || req.query.sortOrder) as any;
      const page = parseInt((req.body.page || req.query.page || '1') as string, 10);
      const limit = parseInt((req.body.limit || req.query.limit || '10') as string, 10);

      const result = await this.service.searchFiles({
        query,
        fileType,
        tags,
        sortBy,
        sortOrder,
        page,
        limit,
      });

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const searchController = new SearchController();
