import client from 'prom-client';

// ============================================================================
// 📊 PROMETHEUS METRICS REGISTRY & CONFIGURATION
// ============================================================================
// Ye file OmniMedia Backend ke sare Prometheus metrics initialize karti hai.
// Grafana / Prometheus Explorer me kon si PromQL queries run kar sakte ho,
// un sabka description aur exact query comments me di gayi hai.

export const registry = new client.Registry();

// ============================================================================
// ⚙️ DEFAULT NODE.JS SYSTEM METRICS (PREFIX: 'omnimedia_node_')
// ============================================================================
// Ye Node.js Process, Memory, CPU, Garbage Collection aur Event Loop Metrics collect karta hai.
//
// 🔍 Grafana PromQL Queries You Can Run:
// ----------------------------------------------------------------------------
// 1. Memory Usage (RAM in Bytes):
//    omnimedia_node_process_resident_memory_bytes
//
// 2. Node.js Used Heap Memory:
//    omnimedia_node_nodejs_heap_size_used_bytes
//
// 3. CPU Total Usage Time (Seconds):
//    omnimedia_node_process_cpu_seconds_total
//
// 4. CPU Usage Percentage (% over 1 min):
//    rate(omnimedia_node_process_cpu_seconds_total[1m]) * 100
//
// 5. Event Loop Lag / Delay (in Seconds):
//    omnimedia_node_nodejs_eventloop_lag_seconds
//
// 6. Total Open File Descriptors:
//    omnimedia_node_process_open_fds
// ============================================================================
client.collectDefaultMetrics({
  register: registry,
  prefix: 'omnimedia_node_',
});

// ============================================================================
// 1. 🌐 HTTP REQUEST COUNTER METRIC
// ============================================================================
// Har incoming HTTP Request (GET, POST, etc.) par counter increment hota hai.
// Location: backend/src/common/middleware/metrics.middleware.ts
//
// 🔍 Grafana PromQL Queries You Can Run:
// ----------------------------------------------------------------------------
// A) Total HTTP requests overall:
//    http_requests_total
//
// B) Requests Rate Per Second (1 minute window):
//    rate(http_requests_total[1m])
//
// C) Filter by Status Code (e.g. Total 200 OK requests):
//    http_requests_total{status_code="200"}
//
// D) Filter 4xx/5xx Errors Rate:
//    rate(http_requests_total{status_code=~"4..|5.."}[1m])
// ============================================================================
export const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests processed by OmniMedia backend',
  labelNames: ['method', 'route', 'status_code'],
  registers: [registry],
});

// ============================================================================
// 2. ⏱️ HTTP REQUEST DURATION HISTOGRAM (RED METHOD: DURATION)
// ============================================================================
// HTTP requests kitna time (seconds me) le rahi hain latency measure karne ke liye.
// Location: backend/src/common/middleware/metrics.middleware.ts
//
// 🔍 Grafana PromQL Queries You Can Run:
// ----------------------------------------------------------------------------
// A) Total Time Spent in Requests:
//    http_request_duration_seconds_sum
//
// B) Total Count of Recorded Durations:
//    http_request_duration_seconds_count
//
// C) Average Response Time (Latency in Seconds over 5m):
//    rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])
//
// D) 95th Percentile Latency (p95 response time):
//    histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))
// ============================================================================
export const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [registry],
});

// ============================================================================
// 3. 🐰 RABBITMQ JOBS COUNTER METRIC
// ============================================================================
// RabbitMQ consumers dwara background jobs complete hone par count karta hai.
//
// 🔍 Grafana PromQL Queries You Can Run:
// ----------------------------------------------------------------------------
// A) Total RabbitMQ Jobs Processed:
//    rabbitmq_jobs_processed_total
//
// B) Successful Jobs Rate:
//    rate(rabbitmq_jobs_processed_total{status="success"}[5m])
//
// C) Failed Jobs Rate:
//    rate(rabbitmq_jobs_processed_total{status="failed"}[5m])
// ============================================================================
export const rabbitmqJobsProcessedTotal = new client.Counter({
  name: 'rabbitmq_jobs_processed_total',
  help: 'Total background jobs processed by RabbitMQ workers',
  labelNames: ['queue', 'status'],
  registers: [registry],
});

// ============================================================================
// 4. 📢 KAFKA EVENTS PUBLISHED COUNTER METRIC
// ============================================================================
// Domain events (UserRegistered, MediaUploaded) Kafka streams me publish karne par counter barhta hai.
//
// 🔍 Grafana PromQL Queries You Can Run:
// ----------------------------------------------------------------------------
// A) Total Events Published:
//    kafka_events_published_total
//
// B) Published Event Rate Per Minute by Topic:
//    rate(kafka_events_published_total[1m])
// ============================================================================
export const kafkaEventsPublishedTotal = new client.Counter({
  name: 'kafka_events_published_total',
  help: 'Total domain events published to Apache Kafka streams',
  labelNames: ['topic', 'event_type'],
  registers: [registry],
});

// ============================================================================
// 5. 🔌 ACTIVE WEBSOCKET CONNECTIONS GAUGE
// ============================================================================
// Real-time Socket.io active client connections measure karne ke liye Gauge.
//
// 🔍 Grafana PromQL Queries You Can Run:
// ----------------------------------------------------------------------------
// A) Current Active WebSocket Clients Connected:
//    active_socket_connections
// ============================================================================
export const activeSocketConnectionsGauge = new client.Gauge({
  name: 'active_socket_connections',
  help: 'Current number of active connected WebSocket client sockets',
  registers: [registry],
});

