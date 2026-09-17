import { Table, Column, Model, DataType, ForeignKey, BelongsTo, Default, AllowNull } from 'sequelize-typescript';
import { User } from './user.model';

export enum NotificationType {
  SYSTEM = 'SYSTEM',
  FILE_PROCESSED = 'FILE_PROCESSED',
  FILE_FAILED = 'FILE_FAILED',
  WELCOME = 'WELCOME',
}

@Table({
  tableName: 'notifications',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id', 'is_read'] },
  ],
})
export class Notification extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  declare id: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({ type: DataType.UUID, field: 'user_id' })
  userId!: string;

  @BelongsTo(() => User)
  user!: User;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(NotificationType)))
  type!: NotificationType;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  title!: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  message!: string;

  @AllowNull(true)
  @Column(DataType.JSONB)
  data?: Record<string, any>;

  @Default(false)
  @Column({ type: DataType.BOOLEAN, field: 'is_read' })
  isRead!: boolean;
}
