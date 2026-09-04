import { User, IUser } from './user.model';

export class UserRepository {
  public async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email: email.toLowerCase() }).exec();
  }

  public async findById(id: string): Promise<IUser | null> {
    return User.findById(id).exec();
  }

  public async createUser(userData: { name: string; email: string; passwordHash: string; avatarUrl?: string }): Promise<IUser> {
    const user = new User({
      name: userData.name,
      email: userData.email.toLowerCase(),
      passwordHash: userData.passwordHash,
      avatarUrl: userData.avatarUrl,
    });
    return user.save();
  }

  public async updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, { $set: updateData }, { new: true }).exec();
  }

  public async addRefreshToken(userId: string, token: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $push: { refreshTokens: token },
    }).exec();
  }

  public async removeRefreshToken(userId: string, token: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $pull: { refreshTokens: token },
    }).exec();
  }

  public async verifyRefreshToken(userId: string, token: string): Promise<boolean> {
    const user = await User.findOne({ _id: userId, refreshTokens: token }).exec();
    return Boolean(user);
  }
}

export const userRepository = new UserRepository();
