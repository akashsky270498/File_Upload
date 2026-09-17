import { Table, Column, Model, DataType, ForeignKey, BelongsTo, AllowNull } from 'sequelize-typescript';
import { User } from './user.model';

@Table({
  tableName: 'audit_logs',
  timestamps: true,
  underscored: true,
  updatedAt: false,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['action'] },
  ],
})
export class AuditLog extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  declare id: string;

  @ForeignKey(() => User)
  @AllowNull(true)
  @Column({ type: DataType.UUID, field: 'user_id' })
  userId?: string;

  @BelongsTo(() => User)
  user?: User;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  action!: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  resource!: string;

  @AllowNull(true)
  @Column({ type: DataType.STRING(255), field: 'resource_id' })
  resourceId?: string;

  @AllowNull(true)
  @Column(DataType.STRING(45))
  ip?: string;

  @AllowNull(true)
  @Column({ type: DataType.TEXT, field: 'user_agent' })
  userAgent?: string;
}
