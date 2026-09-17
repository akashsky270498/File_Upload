import { Table, Column, Model, DataType, ForeignKey, BelongsTo, BelongsToMany, Default, AllowNull, Index } from 'sequelize-typescript';
import { User } from './user.model';
import { Tag } from './tag.model';
import { FileTag } from './file-tag.model';

export enum FileStatus {
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  FAILED = 'FAILED',
  DELETED = 'DELETED',
}

export enum FileType {
  PROFILE_IMAGE = 'PROFILE_IMAGE',
  COVER_IMAGE = 'COVER_IMAGE',
  POST_MEDIA = 'POST_MEDIA',
  DOCUMENT = 'DOCUMENT',
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
}

@Table({
  tableName: 'files',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['file_type'] },
    { fields: ['created_at'] },
  ],
})
export class File extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  declare id: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({ type: DataType.UUID, field: 'user_id' })
  userId!: string;

  @BelongsTo(() => User)
  user!: User;

  @AllowNull(false)
  @Column({ type: DataType.STRING(255), field: 'original_name' })
  originalName!: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  title!: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  description?: string;

  @AllowNull(false)
  @Column({ type: DataType.ENUM(...Object.values(FileType)), field: 'file_type' })
  fileType!: FileType;

  @AllowNull(false)
  @Column({ type: DataType.STRING(100), field: 'mime_type' })
  mimeType!: string;

  @AllowNull(false)
  @Column(DataType.BIGINT)
  size!: number;

  @AllowNull(false)
  @Column({ type: DataType.STRING(500), field: 'cloudinary_url' })
  cloudinaryUrl!: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING(255), field: 'cloudinary_public_id' })
  cloudinaryPublicId!: string;

  @Default(FileStatus.READY)
  @Column(DataType.ENUM(...Object.values(FileStatus)))
  status!: FileStatus;

  @Default(0)
  @Column({ type: DataType.BIGINT, field: 'views_count' })
  viewsCount!: number;

  @BelongsToMany(() => Tag, () => FileTag)
  tags!: Tag[];
}
