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
    
    // Safely add missing enum values if enum_notifications_type exists in PostgreSQL
    try {
      await sequelize.query(`
        DO $$ 
        BEGIN 
          IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_notifications_type') THEN
            BEGIN
              ALTER TYPE "enum_notifications_type" ADD VALUE 'FILE_UPLOADED';
            EXCEPTION WHEN OTHERS THEN null;
            END;
            BEGIN
              ALTER TYPE "enum_notifications_type" ADD VALUE 'MEDIA_PROCESSED';
            EXCEPTION WHEN OTHERS THEN null;
            END;
          END IF;
        END $$;
      `);
    } catch (enumErr) {
      logger.debug({ enumErr }, 'PostgreSQL enum update check bypassed');
    }

    if (env.nodeEnv === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('PostgreSQL database models synchronized.');
    }
  } catch (error) {
    logger.error({ error }, 'Failed to connect to PostgreSQL database.');
    throw error;
  }
};
