import { Request, Response, NextFunction } from 'express';
import { searchService, SearchService } from './search.service';

export class SearchController {
  constructor(private readonly service: SearchService = searchService) {}

  /**
   * GET /api/v1/search
   */
  public search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query.q as string | undefined;
      const fileType = req.query.fileType as string | undefined;
      const tags = req.query.tags ? (req.query.tags as string).split(',') : undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const result = await this.service.searchFiles({
        query,
        fileType,
        tags,
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
