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
   * Initialize omnimedia_files index schema, custom analyzers, and mappings
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
                    type: 'edge_ngram',
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

      // Sync existing PostgreSQL records to Elasticsearch
      await this.syncDatabaseToElasticsearch();
    } catch (error) {
      logger.error({ error }, 'Elasticsearch Index Manager: Failed to initialize index.');
      throw error;
    }
  }

  /**
   * Sync all existing PostgreSQL database files to Elasticsearch index on server boot
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
   * Update views count for a specific file document in Elasticsearch
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
   * Index or Update a File Document in Elasticsearch
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
   * Delete a File Document from Elasticsearch
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
