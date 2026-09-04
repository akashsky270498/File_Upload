import { IUser, IUserResponse } from '../../modules/users/user.interface';

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
