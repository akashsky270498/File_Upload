import { Sequelize } from 'sequelize-typescript';
import { env } from '../../config/env';
import { logger } from '../../common/logger';
import { User } from './models/user.model';
import { File } from './models/file.model';
import { Tag } from './models/tag.model';
import { FileTag } from './models/file-tag.model';
import { Notification } from './models/notification.model';
import { AuditLog } from './models/audit-log.model';
import { RefreshToken } from './models/refresh-token.model';
import { OtpVerification } from './models/otp-verification.model';

export const sequelize = new Sequelize({
  dialect: 'postgres',
  host: env.db.host,
  port: env.db.port,
  database: env.db.name,
  username: env.db.user,
  password: env.db.password,
  logging: env.db.logging ? (msg: string) => logger.debug(msg) : false,
  models: [User, File, Tag, FileTag, Notification, AuditLog, RefreshToken, OtpVerification],
  pool: {
    max: 20,
    min: 2,
    acquire: 30000,
    idle: 10000,
  },
});

export const connectPostgres = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info('PostgreSQL database connection established successfully.');
    if (env.nodeEnv === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('PostgreSQL database models synchronized.');
    }
  } catch (error) {
    logger.error({ error }, 'Failed to connect to PostgreSQL database.');
    throw error;
  }
};
