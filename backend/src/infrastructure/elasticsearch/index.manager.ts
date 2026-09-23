// ==========================================
// 🔎 ELASTICSEARCH INDEX MANAGER
// ==========================================
// Ye manager Elasticsearch Index schema (`omnimedia_files`), custom Edge-NGram Auto-complete Analyzers,
// bulk synchronization aur live document indexing/deletion manage karta hai.

import { esClient, INDEX_NAMES } from '../../config/elasticsearch';
import { logger } from '../../common/logger';
import { File } from '../postgres/models/file.model';
import { Tag } from '../postgres/models/tag.model';

export interface FileSearchDocument {
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
  createdAt: string;
}

export class ElasticsearchIndexManager {
  /**
   * 1. `omnimedia_files` Index create karta hai agar exist na karta ho + edge_ngram autocomplete tokenizer set karta hai
   */
  public async initFilesIndex(): Promise<void> {
    try {
      const exists = await esClient.indices.exists({ index: INDEX_NAMES.FILES });

      if (!exists) {
        await esClient.indices.create({
          index: INDEX_NAMES.FILES,
          body: {
            settings: {
              number_of_shards: 1,
              number_of_replicas: 0,
              analysis: {
                tokenizer: {
                  autocomplete_tokenizer: {
                    type: 'edge_ngram', // Instant search typing autocomplete for 1 to 15 chars
                    min_gram: 1,
                    max_gram: 15,
                    token_chars: ['letter', 'digit'],
                  },
                },
                analyzer: {
                  autocomplete_analyzer: {
                    type: 'custom',
                    tokenizer: 'autocomplete_tokenizer',
                    filter: ['lowercase'],
                  },
                  autocomplete_search_analyzer: {
                    type: 'custom',
                    tokenizer: 'standard',
                    filter: ['lowercase'],
                  },
                },
              },
            },
            mappings: {
              properties: {
                id: { type: 'keyword' },
                userId: { type: 'keyword' },
                title: {
                  type: 'text',
                  analyzer: 'autocomplete_analyzer',
                  search_analyzer: 'autocomplete_search_analyzer',
                  fields: {
                    raw: { type: 'keyword' },
                  },
                },
                description: { type: 'text' },
                fileType: { type: 'keyword' },
                mimeType: { type: 'keyword' },
                size: { type: 'long' },
                viewsCount: { type: 'long' },
                cloudinaryUrl: { type: 'keyword' },
                tags: {
                  type: 'text',
                  analyzer: 'autocomplete_analyzer',
                  search_analyzer: 'autocomplete_search_analyzer',
                  fields: {
                    keyword: { type: 'keyword' },
                  },
                },
                createdAt: { type: 'date' },
              },
            },
          },
        });

        logger.info({ index: INDEX_NAMES.FILES }, 'Elasticsearch Index Manager: Created omnimedia_files index with edge_ngram autocomplete.');
      } else {
        try {
          await esClient.indices.putMapping({
            index: INDEX_NAMES.FILES,
            properties: {
              viewsCount: { type: 'long' },
            },
          });
          logger.info({ index: INDEX_NAMES.FILES }, 'Elasticsearch Index Manager: Updated index mapping with viewsCount property.');
        } catch (err) {
          logger.debug({ err }, 'Elasticsearch putMapping completed.');
        }
      }

      // Server startup par PostgreSQL DB records ko Elasticsearch me bulk sync karte hain
      await this.syncDatabaseToElasticsearch();
    } catch (error) {
      logger.error({ error }, 'Elasticsearch Index Manager: Failed to initialize index.');
      throw error;
    }
  }

  /**
   * 2. PostgreSQL DB records ko Elasticsearch me Bulk Sync karne ka method
   */
  public async syncDatabaseToElasticsearch(): Promise<void> {
    try {
      const files = await File.findAll({
        include: [
          { model: Tag, as: 'tags', attributes: ['name'], through: { attributes: [] } },
        ],
      });

      if (!files || files.length === 0) return;

      const body = files.flatMap((f) => [
        { index: { _index: INDEX_NAMES.FILES, _id: f.id } },
        {
          id: f.id,
          userId: f.userId,
          title: f.title,
          description: f.description || undefined,
          fileType: f.fileType,
          mimeType: f.mimeType,
          size: Number(f.size),
          cloudinaryUrl: f.cloudinaryUrl,
          tags: f.tags ? f.tags.map((t: any) => t.name) : [],
          viewsCount: Number(f.viewsCount) || 0,
          createdAt: f.createdAt ? new Date(f.createdAt).toISOString() : new Date().toISOString(),
        },
      ]);

      await esClient.bulk({ refresh: 'wait_for', body });
      logger.info({ count: files.length }, 'Elasticsearch Index Manager: Synchronized all database files to Elasticsearch index successfully.');
    } catch (err) {
      logger.error({ err }, 'Failed to sync database files to Elasticsearch');
    }
  }

  /**
   * 3. Views count increment hone par Elasticsearch document me views count sync karna
   */
  public async updateViewsCount(fileId: string, viewsCount: number): Promise<void> {
    try {
      await esClient.update({
        index: INDEX_NAMES.FILES,
        id: fileId,
        doc: { viewsCount },
      });
    } catch (err) {
      logger.debug({ err, fileId }, 'Elasticsearch updateViewsCount skipped.');
    }
  }

  /**
   * 4. Single File Document Index / Update karna
   */
  public async indexFile(doc: FileSearchDocument): Promise<void> {
    try {
      await esClient.index({
        index: INDEX_NAMES.FILES,
        id: doc.id,
        document: doc,
        refresh: 'wait_for',
      });
      logger.info({ fileId: doc.id, title: doc.title }, 'Elasticsearch Indexer: Indexed file document successfully.');
    } catch (error) {
      logger.error({ error, fileId: doc.id }, 'Elasticsearch Indexer: Failed to index file document.');
    }
  }

  /**
   * 5. File delete hone par Elasticsearch Index se remove karna
   */
  public async deleteFile(fileId: string): Promise<void> {
    try {
      await esClient.delete({
        index: INDEX_NAMES.FILES,
        id: fileId,
        refresh: 'wait_for',
      });
      logger.info({ fileId }, 'Elasticsearch Indexer: Deleted file document.');
    } catch (error) {
      logger.error({ error, fileId }, 'Elasticsearch Indexer: Failed to delete file document.');
    }
  }
}

export const esIndexManager = new ElasticsearchIndexManager();

