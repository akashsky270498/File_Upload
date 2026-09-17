import { esClient, INDEX_NAMES } from '../../config/elasticsearch';
import { logger } from '../../common/logger';

export interface SearchQueryParams {
  query?: string;
  fileType?: string;
  tags?: string[];
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

    // Full-Text Multi-Match query with Field Boosting and Fuzzy Logic
    if (params.query && params.query.trim().length > 0) {
      mustClauses.push({
        multi_match: {
          query: params.query.trim(),
          fields: ['title^3', 'tags^2', 'description^1'],
          fuzziness: 'AUTO',
          operator: 'or',
        },
      });
    } else {
      mustClauses.push({ match_all: {} });
    }

    // Facet Filter: File Type
    if (params.fileType) {
      filterClauses.push({ term: { fileType: params.fileType } });
    }

    // Facet Filter: Tags
    if (params.tags && params.tags.length > 0) {
      filterClauses.push({ terms: { tags: params.tags } });
    }

    try {
      const response = await esClient.search({
        index: INDEX_NAMES.FILES,
        from,
        size: limit,
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
    } catch (error) {
      logger.error({ error, params }, 'Elasticsearch SearchService: Query execution failed');
      throw error;
    }
  }
}

export const searchService = new SearchService();
