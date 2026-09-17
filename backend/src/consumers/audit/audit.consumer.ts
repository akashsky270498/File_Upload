import { AuditLog } from '../../infrastructure/postgres/models/audit-log.model';
import { KafkaEventEnvelope } from '../../infrastructure/kafka/kafka.producer';
import { logger } from '../../common/logger';

export const handleAuditEvent = async (envelope: KafkaEventEnvelope): Promise<void> => {
  try {
    const { aggregateId, eventType, payload } = envelope;

    logger.info(
      { eventType, aggregateId, payload },
      'Kafka Audit Consumer: Persisting audit event to PostgreSQL'
    );

    await AuditLog.create({
      userId: aggregateId || payload?.userId || null,
      action: eventType,
      resource: payload?.resource || 'system',
      resourceId: payload?.resourceId || aggregateId || null,
      ip: payload?.ip || '127.0.0.1',
      userAgent: payload?.userAgent || 'Internal-Kafka-Consumer',
    });
  } catch (error) {
    logger.error({ error, envelope }, 'Kafka Audit Consumer: Failed to persist audit log record');
  }
};
