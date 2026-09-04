import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { AuthResponseData, AuthTokens } from './auth.interface';
import { sendResponse } from '../../common/utils/apiResponse';
import { AuthenticatedRequest } from '../../common/types/authenticatedRequest.interface';
import { IUserResponse } from '../users/user.interface';
import { UnauthorizedError } from '../../common/errors/customErrors';

export class AuthController {
  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, password } = req.body as Record<string, string>;
      const result: AuthResponseData = await authService.register({ name, email, password });

      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      sendResponse<AuthResponseData>(res, 201, 'User account registered successfully.', result);
    } catch (error) {
      next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body as Record<string, string>;
      const result: AuthResponseData = await authService.login({ email, password });

      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      sendResponse<AuthResponseData>(res, 200, 'Authentication successful.', result);
    } catch (error) {
      next(error);
    }
  };

  public refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cookies = (req.cookies || {}) as Record<string, string>;
      const body = (req.body || {}) as Record<string, string>;
      const refreshToken = cookies.refreshToken || body.refreshToken || '';

      const tokens: AuthTokens = await authService.refreshTokens(refreshToken);

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      sendResponse<AuthTokens>(res, 200, 'Access token refreshed successfully.', tokens);
    } catch (error) {
      next(error);
    }
  };

  public logout = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const cookies = (req.cookies || {}) as Record<string, string>;
      const body = (req.body || {}) as Record<string, string>;
      const refreshToken = cookies.refreshToken || body.refreshToken || '';

      if (userId) {
        await authService.logout(userId, refreshToken);
      }

      res.clearCookie('refreshToken');
      sendResponse(res, 200, 'Successfully logged out.');
    } catch (error) {
      next(error);
    }
  };

  public getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        sendResponse(res, 401, 'User not authenticated.');
        return;
      }

      const user: IUserResponse = await authService.getProfile(userId);
      sendResponse<IUserResponse>(res, 200, 'User profile retrieved successfully.', user);
    } catch (error) {
      next(error);
    }
  };

  public changePassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError('User authentication required.');
      }

      const { currentPassword, newPassword } = req.body as Record<string, string>;
      await authService.changePassword(userId, { currentPassword, newPassword });

      sendResponse(res, 200, 'Password changed successfully.');
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();

