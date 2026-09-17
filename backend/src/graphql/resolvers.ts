import { GraphQLError } from 'graphql';
import { User } from '../infrastructure/postgres/models/user.model';
import { File } from '../infrastructure/postgres/models/file.model';
import { Notification } from '../infrastructure/postgres/models/notification.model';
import { AuditLog } from '../infrastructure/postgres/models/audit-log.model';
import { GraphQLContext } from './context';

export const resolvers = {
  Query: {
    me: async (_parent: any, _args: any, context: GraphQLContext) => {
      if (!context.currentUser) {
        throw new GraphQLError('Authentication token required', {
          extensions: { code: 'UNAUTHENTICATED', http: { status: 401 } },
        });
      }

      const user = await User.findByPk(context.currentUser.userId);
      if (!user) {
        throw new GraphQLError('User profile not found', {
          extensions: { code: 'NOT_FOUND', http: { status: 404 } },
        });
      }

      return user;
    },

    user: async (_parent: any, args: { id: string }) => {
      const user = await User.findByPk(args.id);
      if (!user) {
        throw new GraphQLError(`User with ID '${args.id}' not found`, {
          extensions: { code: 'NOT_FOUND', http: { status: 404 } },
        });
      }
      return user;
    },

    files: async (_parent: any, args: { fileType?: string; limit?: number; offset?: number }) => {
      const limit = Math.min(100, Math.max(1, args.limit || 10));
      const offset = Math.max(0, args.offset || 0);

      const whereClause = args.fileType ? { fileType: args.fileType } : {};

      const files = await File.findAll({
        where: whereClause,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });

      return files;
    },

    file: async (_parent: any, args: { id: string }) => {
      const file = await File.findByPk(args.id);
      if (!file) {
        throw new GraphQLError(`File with ID '${args.id}' not found`, {
          extensions: { code: 'NOT_FOUND', http: { status: 404 } },
        });
      }
      return file;
    },

    myNotifications: async (_parent: any, args: { limit?: number }, context: GraphQLContext) => {
      if (!context.currentUser) {
        throw new GraphQLError('Authentication token required', {
          extensions: { code: 'UNAUTHENTICATED', http: { status: 401 } },
        });
      }

      const limit = Math.min(50, Math.max(1, args.limit || 20));

      const notifications = await Notification.findAll({
        where: { userId: context.currentUser.userId },
        limit,
        order: [['createdAt', 'DESC']],
      });

      return notifications;
    },

    auditLogs: async (_parent: any, args: { limit?: number }) => {
      const limit = Math.min(100, Math.max(1, args.limit || 50));

      const logs = await AuditLog.findAll({
        limit,
        order: [['createdAt', 'DESC']],
      });

      return logs;
    },
  },

  File: {
    user: async (parent: File, _args: any, context: GraphQLContext) => {
      if (!parent.userId) return null;
      return context.loaders.userDataLoader.load(parent.userId);
    },

    tags: async (parent: File, _args: any, context: GraphQLContext) => {
      return context.loaders.fileTagsDataLoader.load(parent.id);
    },
  },

  User: {
    files: async (parent: User) => {
      return File.findAll({
        where: { userId: parent.id },
        order: [['createdAt', 'DESC']],
      });
    },
  },
};
