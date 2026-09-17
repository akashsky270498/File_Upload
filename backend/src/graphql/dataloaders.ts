import DataLoader from 'dataloader';
import { User } from '../infrastructure/postgres/models/user.model';
import { Tag } from '../infrastructure/postgres/models/tag.model';
import { FileTag } from '../infrastructure/postgres/models/file-tag.model';
import { Op } from 'sequelize';

export interface GraphQLDataLoaders {
  userDataLoader: DataLoader<string, User | null>;
  fileTagsDataLoader: DataLoader<string, Tag[]>;
}

export const createDataLoaders = (): GraphQLDataLoaders => {
  return {
    /**
     * Batch User loader to solve N+1 user queries in File resolvers
     */
    userDataLoader: new DataLoader<string, User | null>(async (userIds: readonly string[]) => {
      const users = await User.findAll({
        where: {
          id: {
            [Op.in]: [...userIds],
          },
        },
      });

      const userMap = new Map<string, User>();
      users.forEach((u) => userMap.set(u.id, u));

      return userIds.map((id) => userMap.get(id) || null);
    }),

    /**
     * Batch Tag loader to solve N+1 tag queries across file listings
     */
    fileTagsDataLoader: new DataLoader<string, Tag[]>(async (fileIds: readonly string[]) => {
      const fileTags = await FileTag.findAll({
        where: {
          fileId: {
            [Op.in]: [...fileIds],
          },
        },
        include: [Tag],
      });

      const fileTagsMap = new Map<string, Tag[]>();
      fileTags.forEach((ft) => {
        if (!fileTagsMap.has(ft.fileId)) {
          fileTagsMap.set(ft.fileId, []);
        }
        if (ft.tag) {
          fileTagsMap.get(ft.fileId)!.push(ft.tag);
        }
      });

      return fileIds.map((id) => fileTagsMap.get(id) || []);
    }),
  };
};
