import { Table, Column, Model, DataType, ForeignKey, BelongsTo, AllowNull, Default } from 'sequelize-typescript';
import { User } from './user.model';

export enum OtpType {
  EMAIL_LOGIN = 'EMAIL_LOGIN',
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  MOBILE_LOGIN = 'MOBILE_LOGIN',
  PASSWORD_RESET = 'PASSWORD_RESET',
}

@Table({
  tableName: 'otp_verifications',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['identifier', 'type'] },
  ],
})
export class OtpVerification extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  declare id: string;

  @ForeignKey(() => User)
  @AllowNull(true)
  @Column({ type: DataType.UUID, field: 'user_id' })
  userId?: string;

  @BelongsTo(() => User)
  user?: User;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  identifier!: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING(255), field: 'otp_hash' })
  otpHash!: string;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(OtpType)))
  type!: OtpType;

  @AllowNull(false)
  @Column({ type: DataType.DATE, field: 'expires_at' })
  expiresAt!: Date;

  @Default(0)
  @Column(DataType.INTEGER)
  attempts!: number;

  @AllowNull(true)
  @Column({ type: DataType.DATE, field: 'verified_at' })
  verifiedAt?: Date;
}
