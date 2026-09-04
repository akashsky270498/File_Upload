import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string;
  refreshTokens: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserResponse {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserProfileInput {
  name?: string;
  avatarUrl?: string;
}

export const sanitizeUser = (user: IUser): IUserResponse => {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};
