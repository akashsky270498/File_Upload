import { User } from '../../infrastructure/postgres/models/user.model';

export class UsersRepository {
  /**
   * Find user by primary key ID
   */
  public async findById(id: string): Promise<User | null> {
    return User.findByPk(id);
  }

  /**
   * Find user by mobile number
   */
  public async findByMobileNumber(mobileNumber: string): Promise<User | null> {
    return User.findOne({
      where: { mobileNumber },
    });
  }

  /**
   * Update user profile by ID
   */
  public async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const user = await User.findByPk(id);
    if (!user) return null;

    await user.update(updates);
    return user;
  }
}

export const usersRepository = new UsersRepository();
