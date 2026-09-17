import { Client } from '@elastic/elasticsearch';
import { env } from './env';
import { logger } from '../common/logger';

export const INDEX_NAMES = {
  FILES: 'omnimedia_files',
} as const;

export const esClient = new Client({
  node: env.elasticsearch.node,
  maxRetries: 5,
  requestTimeout: 10000,
});

export const connectElasticsearch = async (): Promise<void> => {
  try {
    const health = await esClient.cluster.health();
    logger.info(
      { status: health.status, numberOfNodes: health.number_of_nodes },
      'Elasticsearch cluster health verified successfully.'
    );
  } catch (error) {
    logger.error({ error }, 'Failed to connect to Elasticsearch cluster.');
    throw error;
  }
};
