import { esClient, INDEX_NAMES } from '../../config/elasticsearch';
import { logger } from '../../common/logger';

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
                    min_gram: 2,
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
                cloudinaryUrl: { type: 'keyword' },
                tags: { type: 'keyword' },
                createdAt: { type: 'date' },
              },
            },
          },
        });

        logger.info({ index: INDEX_NAMES.FILES }, 'Elasticsearch Index Manager: Created omnimedia_files index with edge_ngram autocomplete.');
      } else {
        logger.info({ index: INDEX_NAMES.FILES }, 'Elasticsearch Index Manager: Index already exists.');
      }
    } catch (error) {
      logger.error({ error }, 'Elasticsearch Index Manager: Failed to initialize index.');
      throw error;
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
