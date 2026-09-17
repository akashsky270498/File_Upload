import dotenv from 'dotenv';
import path from 'path';
import Joi from 'joi';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(5000),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_NAME: Joi.string().required(),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_LOGGING: Joi.boolean().default(false),
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').optional(),
  RABBITMQ_URL: Joi.string().default('amqp://omnimedia:omnimedia_password@127.0.0.1:5672'),
  KAFKA_BROKERS: Joi.string().default('localhost:9092'),
  ELASTICSEARCH_NODE: Joi.string().default('http://localhost:9200'),
  CLIENT_URL: Joi.string().default('http://localhost:5173'),
  JWT_ACCESS_SECRET: Joi.string().default('super_secret_access_key_12345!@#$%'),
  JWT_ACCESS_EXPIRATION: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().default('super_secret_refresh_key_67890!@#$%'),
  JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),
}).unknown();

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const env = {
  nodeEnv: envVars.NODE_ENV as string,
  port: envVars.PORT as number,
  clientUrl: envVars.CLIENT_URL as string,
  db: {
    host: envVars.DB_HOST as string,
    port: envVars.DB_PORT as number,
    name: envVars.DB_NAME as string,
    user: envVars.DB_USER as string,
    password: envVars.DB_PASSWORD as string,
    logging: envVars.DB_LOGGING as boolean,
  },
  redis: {
    host: envVars.REDIS_HOST as string,
    port: envVars.REDIS_PORT as number,
    password: envVars.REDIS_PASSWORD as string || undefined,
  },
  rabbitmq: {
    url: envVars.RABBITMQ_URL as string,
  },
  kafka: {
    brokers: (envVars.KAFKA_BROKERS as string).split(','),
  },
  elasticsearch: {
    node: envVars.ELASTICSEARCH_NODE as string,
  },
  jwt: {
    accessSecret: envVars.JWT_ACCESS_SECRET as string,
    accessExpiration: envVars.JWT_ACCESS_EXPIRATION as string,
    refreshSecret: envVars.JWT_REFRESH_SECRET as string,
    refreshExpiration: envVars.JWT_REFRESH_EXPIRATION as string,
  },
};
