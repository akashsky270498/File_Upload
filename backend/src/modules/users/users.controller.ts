import { Response, NextFunction } from 'express';
import { usersService, UsersService } from './users.service';
import { UnauthorizedError } from '../../common/errors/app-error';
import { AuthenticatedRequest } from '../../common/middleware/auth';

export class UsersController {
  constructor(private readonly service: UsersService = usersService) {}

  /**
   * REST PUT /api/v1/users/profile
   */
  public updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError('Authentication token missing or invalid');
      }

      const dto = {
        firstName: req.body.firstName || req.body.first_name,
        lastName: req.body.lastName || req.body.last_name,
        mobileNumber: req.body.mobileNumber || req.body.mobile_number,
        profileImage: req.body.profileImage || req.body.profile_image,
      };

      const avatarFile = req.file;

      const updatedProfile = await this.service.updateProfile(userId, dto, avatarFile);

      res.status(200).json({
        status: 'success',
        message: 'Profile updated successfully',
        data: updatedProfile,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const usersController = new UsersController();
