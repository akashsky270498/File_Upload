import { GraphQLError } from 'graphql';
import { User } from '../infrastructure/postgres/models/user.model';
import { File } from '../infrastructure/postgres/models/file.model';
import { Notification } from '../infrastructure/postgres/models/notification.model';
import { AuditLog } from '../infrastructure/postgres/models/audit-log.model';
import { GraphQLContext } from './context';
import { usersService } from '../modules/users/users.service';

import { uploadRepository } from '../modules/uploads/upload.repository';

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
        include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'profileImage'] }],
      });

      return files;
    },

    file: async (_parent: any, args: { id: string }) => {
      try {
        const file = await uploadRepository.findByIdAndIncrementView(args.id);
        return file;
      } catch (err: any) {
        throw new GraphQLError(err.message || `File with ID '${args.id}' not found`, {
          extensions: { code: 'NOT_FOUND', http: { status: 404 } },
        });
      }
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

  Mutation: {
    updateProfile: async (_parent: any, args: { input: { firstName?: string; lastName?: string; mobileNumber?: string; profileImageUrl?: string; profileImage?: string } }, context: GraphQLContext) => {
      if (!context.currentUser) {
        throw new GraphQLError('Authentication token required', {
          extensions: { code: 'UNAUTHENTICATED', http: { status: 401 } },
        });
      }

      try {
        const dto = {
          firstName: args.input.firstName,
          lastName: args.input.lastName,
          mobileNumber: args.input.mobileNumber,
          profileImage: args.input.profileImage || args.input.profileImageUrl,
        };

        const updatedProfile = await usersService.updateProfile(context.currentUser.userId, dto);
        const user = await User.findByPk(updatedProfile.id);
        return user;
      } catch (err: any) {
        throw new GraphQLError(err.message || 'Failed to update profile', {
          extensions: { code: err.errorCode || 'BAD_USER_INPUT', http: { status: err.statusCode || 400 } },
        });
      }
    },
  },

  File: {
    viewsCount: (parent: File) => Number(parent.viewsCount) || 0,

    user: async (parent: File, _args: any, context: GraphQLContext) => {
      if ((parent as any).user) return (parent as any).user;
      if (!parent.userId) return null;
      return context.loaders.userDataLoader.load(parent.userId);
    },

    tags: async (parent: File, _args: any, context: GraphQLContext) => {
      return context.loaders.fileTagsDataLoader.load(parent.id);
    },
  },

  User: {
    profileImage: (parent: User) => parent.profileImage,
    profileImageUrl: (parent: User) => parent.profileImage,
    coverImageUrl: (parent: User) => parent.coverImage,
    files: async (parent: User) => {
      return File.findAll({
        where: { userId: parent.id },
        order: [['createdAt', 'DESC']],
      });
    },
  },
};

