import { Table, Column, Model, DataType, ForeignKey } from 'sequelize-typescript';
import { File } from './file.model';
import { Tag } from './tag.model';

@Table({ tableName: 'file_tags', timestamps: false, underscored: true })
export class FileTag extends Model {
  @ForeignKey(() => File)
  @Column({ type: DataType.UUID, primaryKey: true })
  fileId!: string;

  @ForeignKey(() => Tag)
  @Column({ type: DataType.UUID, primaryKey: true })
  tagId!: string;
}
