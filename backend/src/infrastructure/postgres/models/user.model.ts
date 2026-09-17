import { Table, Column, Model, DataType, HasMany, Unique, Default, AllowNull } from 'sequelize-typescript';
import { File } from './file.model';
import { Notification } from './notification.model';
import { AuditLog } from './audit-log.model';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
}

@Table({
  tableName: 'users',
  timestamps: true,
  underscored: true,
  indexes: [
    { unique: true, fields: ['email'] },
    { unique: true, fields: ['mobile_number'] },
  ],
})
export class User extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  id!: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING(255))
  email!: string;

  @Unique
  @AllowNull(true)
  @Column({ type: DataType.STRING(20), field: 'mobile_number' })
  mobileNumber?: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING(255), field: 'password_hash' })
  passwordHash!: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING(100), field: 'first_name' })
  firstName!: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING(100), field: 'last_name' })
  lastName!: string;

  @AllowNull(true)
  @Column({ type: DataType.STRING(500), field: 'profile_image' })
  profileImage?: string;

  @AllowNull(true)
  @Column({ type: DataType.STRING(500), field: 'cover_image' })
  coverImage?: string;

  @Default(false)
  @Column({ type: DataType.BOOLEAN, field: 'is_email_verified' })
  isEmailVerified!: boolean;

  @Default(false)
  @Column({ type: DataType.BOOLEAN, field: 'is_mobile_verified' })
  isMobileVerified!: boolean;

  @Default(UserStatus.ACTIVE)
  @Column(DataType.ENUM(...Object.values(UserStatus)))
  status!: UserStatus;

  @Default(UserRole.USER)
  @Column(DataType.ENUM(...Object.values(UserRole)))
  role!: UserRole;

  @AllowNull(true)
  @Column({ type: DataType.DATE, field: 'last_login_at' })
  lastLoginAt?: Date;

  @HasMany(() => File)
  files!: File[];

  @HasMany(() => Notification)
  notifications!: Notification[];

  @HasMany(() => AuditLog)
  auditLogs!: AuditLog[];
}
