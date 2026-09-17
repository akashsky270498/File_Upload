import { esClient, INDEX_NAMES } from '../../config/elasticsearch';
import { logger } from '../../common/logger';
import { User } from '../../infrastructure/postgres/models/user.model';
import { File } from '../../infrastructure/postgres/models/file.model';
import { Tag } from '../../infrastructure/postgres/models/tag.model';
import { Op } from 'sequelize';

export interface SearchQueryParams {
  query?: string;
  fileType?: string;
  tags?: string[];
  sortBy?: 'relevance' | 'views' | 'date' | 'size';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SearchResultItem {
  id: string;
  userId: string;
  title: string;
  description?: string;
  fileType: string;
  mimeType: string;
  size: number;
  cloudinaryUrl: string;
  tags: string[];
  viewsCount?: number;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    profileImage?: string;
  };
  createdAt: string;
  score?: number;
}

export interface SearchResponseDTO {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  results: SearchResultItem[];
  facets: {
    fileTypeCounts: Record<string, number>;
    topTags: Record<string, number>;
  };
}

export class SearchService {
  /**
   * Perform advanced full-text search with boosted fields, fuzzy matching, filters, and aggregations
   */
  public async searchFiles(params: SearchQueryParams): Promise<SearchResponseDTO> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 10));
    const from = (page - 1) * limit;

    const mustClauses: any[] = [];
    const filterClauses: any[] = [];

    // Full-Text Multi-Match + Wildcard + Prefix query for partial tag & title matching
    if (params.query && params.query.trim().length > 0) {
      const searchTerm = params.query.trim().toLowerCase();
      mustClauses.push({
        bool: {
          should: [
            {
              multi_match: {
                query: searchTerm,
                fields: ['title^4', 'tags^3', 'description^1'],
                fuzziness: 'AUTO',
                operator: 'or',
              },
            },
            {
              wildcard: {
                title: { value: `*${searchTerm}*`, case_insensitive: true },
              },
            },
            {
              wildcard: {
                tags: { value: `*${searchTerm}*`, case_insensitive: true },
              },
            },
            {
              prefix: {
                title: { value: searchTerm, case_insensitive: true },
              },
            },
            {
              prefix: {
                tags: { value: searchTerm, case_insensitive: true },
              },
            },
          ],
          minimum_should_match: 1,
        },
      });
    } else {
      mustClauses.push({ match_all: {} });
    }

    // Facet Filter: File Type Mapping
    if (params.fileType && params.fileType !== 'all') {
      const ft = params.fileType.toUpperCase();
      if (ft === 'IMAGE' || ft === 'IMAGES' || ft === 'POST_MEDIA') {
        filterClauses.push({ terms: { fileType: ['POST_MEDIA', 'PROFILE_IMAGE', 'COVER_IMAGE', 'IMAGE', 'image', 'post_media'] } });
      } else if (ft === 'PDF' || ft === 'DOCUMENT' || ft === 'DOCUMENTS') {
        filterClauses.push({ terms: { fileType: ['DOCUMENT', 'PDF', 'pdf', 'document'] } });
      } else {
        filterClauses.push({ terms: { fileType: [ft, params.fileType, params.fileType.toLowerCase()] } });
      }
    }

    // Facet Filter: Tags
    if (params.tags && params.tags.length > 0) {
      filterClauses.push({ terms: { tags: params.tags } });
    }

    // Sort clause for Elasticsearch with unmapped_type handling to prevent shard exceptions on unmapped fields
    let esSort: any[] = [{ createdAt: { order: 'desc', unmapped_type: 'date' } }];
    if (params.sortBy === 'views') {
      esSort = [{ viewsCount: { order: params.sortOrder || 'desc', unmapped_type: 'long' } }];
    } else if (params.sortBy === 'date') {
      esSort = [{ createdAt: { order: params.sortOrder || 'desc', unmapped_type: 'date' } }];
    } else if (params.sortBy === 'size') {
      esSort = [{ size: { order: params.sortOrder || 'desc', unmapped_type: 'long' } }];
    } else if (params.query && params.query.trim().length > 0) {
      esSort = [{ _score: { order: 'desc' } }, { createdAt: { order: 'desc', unmapped_type: 'date' } }];
    }

    try {
      const response = await esClient.search({
        index: INDEX_NAMES.FILES,
        from,
        size: limit,
        sort: esSort,
        query: {
          bool: {
            must: mustClauses,
            filter: filterClauses,
          },
        },
        aggs: {
          by_file_type: {
            terms: { field: 'fileType' },
          },
          top_tags: {
            terms: { field: 'tags', size: 10 },
          },
        },
      });

      const total = typeof response.hits.total === 'number' ? response.hits.total : (response.hits.total?.value || 0);

      const results: SearchResultItem[] = response.hits.hits.map((hit: any) => ({
        ...hit._source,
        score: hit._score,
      }));

      // If Elasticsearch returns results, hydrate user metadata & viewsCount
      if (results.length > 0) {
        const fileIds = results.map((r) => r.id).filter(Boolean);
        if (fileIds.length > 0) {
          const dbFiles = await File.findAll({
            where: { id: fileIds },
            include: [
              { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'profileImage'] },
              { model: Tag, as: 'tags', attributes: ['name'], through: { attributes: [] } },
            ],
          });

          const fileMap = new Map(dbFiles.map((f) => [f.id, f]));
          results.forEach((r: any) => {
            const dbFile = fileMap.get(r.id);
            if (dbFile) {
              r.viewsCount = Number(dbFile.viewsCount) || 0;
              if (dbFile.tags && dbFile.tags.length > 0) {
                r.tags = dbFile.tags.map((t: any) => t.name);
              }
              if (dbFile.user) {
                r.user = {
                  id: dbFile.user.id,
                  firstName: dbFile.user.firstName,
                  lastName: dbFile.user.lastName,
                  email: dbFile.user.email,
                  profileImage: dbFile.user.profileImage,
                };
              }
            }
          });
        }

        // Parse aggregations
        const fileTypeCounts: Record<string, number> = {};
        const fileTypeBuckets = (response.aggregations?.by_file_type as any)?.buckets || [];
        fileTypeBuckets.forEach((bucket: any) => {
          fileTypeCounts[bucket.key] = bucket.doc_count;
        });

        const topTags: Record<string, number> = {};
        const tagBuckets = (response.aggregations?.top_tags as any)?.buckets || [];
        tagBuckets.forEach((bucket: any) => {
          topTags[bucket.key] = bucket.doc_count;
        });

        return {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          results,
          facets: {
            fileTypeCounts,
            topTags,
          },
        };
      }
    } catch (error) {
      logger.error({ error, params }, 'Elasticsearch SearchService failed, executing PostgreSQL fallback search.');
    }

    // Execute PostgreSQL fallback search when ES returns 0 results or throws error
    const whereClause: any = {};
    if (params.fileType && params.fileType !== 'all') {
      const ft = params.fileType.toUpperCase();
      if (ft === 'IMAGE' || ft === 'IMAGES' || ft === 'POST_MEDIA') {
        whereClause.fileType = { [Op.in]: ['POST_MEDIA', 'PROFILE_IMAGE', 'COVER_IMAGE'] };
      } else if (ft === 'PDF' || ft === 'DOCUMENT' || ft === 'DOCUMENTS') {
        whereClause.fileType = { [Op.in]: ['DOCUMENT'] };
      } else if (ft === 'VIDEO') {
        whereClause.fileType = 'VIDEO';
      } else if (ft === 'AUDIO') {
        whereClause.fileType = 'AUDIO';
      } else {
        whereClause.fileType = params.fileType;
      }
    }

    if (params.query && params.query.trim().length > 0) {
      const q = `%${params.query.trim().toLowerCase()}%`;
      whereClause[Op.or] = [
        { title: { [Op.iLike]: q } },
        { description: { [Op.iLike]: q } },
        { originalName: { [Op.iLike]: q } },
        { '$tags.name$': { [Op.iLike]: q } },
      ];
    }

    let dbOrder: any[] = [['createdAt', 'DESC']];
    if (params.sortBy === 'views') {
      dbOrder = [['viewsCount', params.sortOrder === 'asc' ? 'ASC' : 'DESC']];
    } else if (params.sortBy === 'date') {
      dbOrder = [['createdAt', params.sortOrder === 'asc' ? 'ASC' : 'DESC']];
    } else if (params.sortBy === 'size') {
      dbOrder = [['size', params.sortOrder === 'asc' ? 'ASC' : 'DESC']];
    }

    const { count, rows } = await File.findAndCountAll({
      where: whereClause,
      limit,
      offset: from,
      order: dbOrder,
      distinct: true,
      subQuery: false,
      include: [
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'profileImage'] },
        { model: Tag, as: 'tags', attributes: ['name'], through: { attributes: [] } },
      ],
    });

    const results: SearchResultItem[] = rows.map((f) => {
      const json = f.toJSON() as any;
      return {
        id: json.id,
        userId: json.userId,
        title: json.title,
        description: json.description,
        fileType: json.fileType,
        mimeType: json.mimeType,
        size: Number(json.size),
        cloudinaryUrl: json.cloudinaryUrl,
        tags: json.tags ? json.tags.map((t: any) => t.name) : [],
        viewsCount: Number(json.viewsCount) || 0,
        user: json.user ? {
          id: json.user.id,
          firstName: json.user.firstName,
          lastName: json.user.lastName,
          email: json.user.email,
          profileImage: json.user.profileImage,
        } : undefined,
        createdAt: json.createdAt,
      };
    });

    return {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
      results,
      facets: {
        fileTypeCounts: {},
        topTags: {},
      },
    };
  }
}

export const searchService = new SearchService();
