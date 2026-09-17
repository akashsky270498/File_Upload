import { Transaction } from 'sequelize';
import { sequelize } from '../../infrastructure/postgres';
import { File, FileStatus, FileType } from '../../infrastructure/postgres/models/file.model';
import { Tag } from '../../infrastructure/postgres/models/tag.model';
import { FileTag } from '../../infrastructure/postgres/models/file-tag.model';
import { User } from '../../infrastructure/postgres/models/user.model';

export interface CreateFileRecordData {
  userId: string;
  originalName: string;
  title: string;
  description?: string;
  fileType: FileType;
  mimeType: string;
  size: number;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  tags?: string[];
}

export class UploadRepository {
  /**
   * Execute atomic transaction to save File metadata, associate Tags, and update User Profile/Cover Image if applicable
   */
  public async createFileRecord(data: CreateFileRecordData): Promise<{ file: File; tagNames: string[] }> {
    return sequelize.transaction(async (transaction: Transaction) => {
      // 1. Create File metadata record
      const fileRecord = await File.create(
        {
          userId: data.userId,
          originalName: data.originalName,
          title: data.title,
          description: data.description || null,
          fileType: data.fileType,
          mimeType: data.mimeType,
          size: data.size,
          cloudinaryUrl: data.cloudinaryUrl,
          cloudinaryPublicId: data.cloudinaryPublicId,
          status: FileStatus.READY,
          viewsCount: 0,
        },
        { transaction }
      );

      // 2. Handle Tags & Junction FileTags
      const tagNames: string[] = [];
      if (data.tags && data.tags.length > 0) {
        for (const rawTag of data.tags) {
          const normalizedTag = rawTag.trim().toLowerCase();
          if (normalizedTag.length === 0) continue;

          const [tag] = await Tag.findOrCreate({
            where: { name: normalizedTag },
            defaults: { name: normalizedTag },
            transaction,
          });

          await FileTag.create(
            {
              fileId: fileRecord.id,
              tagId: tag.id,
            },
            { transaction }
          );

          tagNames.push(normalizedTag);
        }
      }

      // 3. Automatically update User profile_image or cover_image if applicable
      if (data.fileType === FileType.PROFILE_IMAGE) {
        await User.update(
          { profileImage: data.cloudinaryUrl },
          { where: { id: data.userId }, transaction }
        );
      } else if (data.fileType === FileType.COVER_IMAGE) {
        await User.update(
          { coverImage: data.cloudinaryUrl },
          { where: { id: data.userId }, transaction }
        );
      }

      return { file: fileRecord, tagNames };
    });
  }
}

export const uploadRepository = new UploadRepository();
