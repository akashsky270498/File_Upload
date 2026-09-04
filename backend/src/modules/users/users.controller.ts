import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../common/types/authenticatedRequest.interface';
import { userService, UserService } from './users.service';
import { ApiResponse } from '../../common/types/apiResponse.interface';
import { IUser } from './user.interface';

export class UserController {
  private service: UserService;

  constructor(service: UserService = userService) {
    this.service = service;
  }

  public getProfile = async (
    req: AuthenticatedRequest,
    res: Response<ApiResponse<IUser>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const user = await this.service.getProfile(userId);

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'User profile retrieved successfully.',
        data: user,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  public updateProfile = async (
    req: AuthenticatedRequest,
    res: Response<ApiResponse<IUser>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const body = req.body as { name?: string; avatarUrl?: string };
      const updatedUser = await this.service.updateProfile(userId, body, req.file);

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'User profile updated successfully.',
        data: updatedUser,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };
}

export const userController = new UserController();
