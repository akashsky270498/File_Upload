import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { logger } from '../common/logger';

const traceExporter = new OTLPTraceExporter({
  url: process.env.JAEGER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
});

export const otelSDK = new NodeSDK({
  serviceName: 'omnimedia-backend',
  traceExporter,
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
  ],
});

export const initTracing = async (): Promise<void> => {
  try {
    otelSDK.start();
    logger.info('OpenTelemetry Distributed Tracing SDK started. Exporting spans to Jaeger OTLP.');
  } catch (error) {
    logger.error({ error }, 'Failed to initialize OpenTelemetry SDK.');
  }
};
