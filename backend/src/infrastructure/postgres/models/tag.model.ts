import { Table, Column, Model, DataType, Unique, AllowNull, BelongsToMany } from 'sequelize-typescript';
import { File } from './file.model';
import { FileTag } from './file-tag.model';

@Table({ tableName: 'tags', timestamps: true, underscored: true })
export class Tag extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  declare id: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING(50))
  name!: string;

  @BelongsToMany(() => File, () => FileTag)
  files!: File[];
}
