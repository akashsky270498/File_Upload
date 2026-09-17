import { Table, Column, Model, DataType, ForeignKey, BelongsTo, AllowNull } from 'sequelize-typescript';
import { User } from './user.model';

@Table({
  tableName: 'refresh_tokens',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['token_hash'] },
  ],
})
export class RefreshToken extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  id!: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({ type: DataType.UUID, field: 'user_id' })
  userId!: string;

  @BelongsTo(() => User)
  user!: User;

  @AllowNull(false)
  @Column({ type: DataType.STRING(255), field: 'token_hash' })
  tokenHash!: string;

  @AllowNull(false)
  @Column({ type: DataType.DATE, field: 'expires_at' })
  expiresAt!: Date;

  @AllowNull(true)
  @Column({ type: DataType.DATE, field: 'revoked_at' })
  revokedAt?: Date;
}
