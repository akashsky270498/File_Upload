import client from 'prom-client';

// Create a custom Prometheus Registry
export const registry = new client.Registry();

// Collect Default Node.js system metrics (CPU, Memory, Event Loop Lag, GC)
client.collectDefaultMetrics({
  register: registry,
  prefix: 'omnimedia_node_',
});

// 1. HTTP Request Counter Metric
export const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests processed by OmniMedia backend',
  labelNames: ['method', 'route', 'status_code'],
  registers: [registry],
});

// 2. HTTP Request Duration Histogram Metric (RED Method: Duration)
export const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [registry],
});

// 3. RabbitMQ Jobs Counter Metric
export const rabbitmqJobsProcessedTotal = new client.Counter({
  name: 'rabbitmq_jobs_processed_total',
  help: 'Total background jobs processed by RabbitMQ workers',
  labelNames: ['queue', 'status'],
  registers: [registry],
});

// 4. Kafka Events Published Counter Metric
export const kafkaEventsPublishedTotal = new client.Counter({
  name: 'kafka_events_published_total',
  help: 'Total domain events published to Apache Kafka streams',
  labelNames: ['topic', 'event_type'],
  registers: [registry],
});

// 5. Active WebSocket Connections Gauge
export const activeSocketConnectionsGauge = new client.Gauge({
  name: 'active_socket_connections',
  help: 'Current number of active connected WebSocket client sockets',
  registers: [registry],
});
