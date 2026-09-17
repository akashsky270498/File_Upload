import { Request, Response, NextFunction, CookieOptions } from 'express';
import { authService, AuthService } from './auth.service';
import { AuthenticatedRequest } from '../../common/middleware/auth';
import { env } from '../../config/env';
import {
  RegisterDTO,
  LoginDTO,
  RequestOtpDTO,
  VerifyOtpDTO,
  RefreshTokenDTO,
  ForgotPasswordDTO,
  ResetPasswordDTO,
  ChangePasswordDTO,
} from './auth.interface';

const isProduction = env.nodeEnv === 'production';

const getAccessCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  maxAge: 15 * 60 * 1000, // 15 mins
  path: '/',
});

const getRefreshCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
});

export class AuthController {
  constructor(private readonly service: AuthService = authService) {}

  private setAuthCookies(res: Response, accessToken?: string, refreshToken?: string): void {
    if (accessToken) {
      res.cookie('accessToken', accessToken, getAccessCookieOptions());
      res.setHeader('X-Access-Token', accessToken);
    }
    if (refreshToken) {
      res.cookie('refreshToken', refreshToken, getRefreshCookieOptions());
      res.setHeader('X-Refresh-Token', refreshToken);
    }
  }

  private clearAuthCookies(res: Response): void {
    res.clearCookie('accessToken', { path: '/', httpOnly: true, secure: isProduction, sameSite: isProduction ? 'none' : 'lax' });
    res.clearCookie('refreshToken', { path: '/', httpOnly: true, secure: isProduction, sameSite: isProduction ? 'none' : 'lax' });
  }

  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: RegisterDTO = req.body;
      const result = await this.service.register(dto);
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: LoginDTO = req.body;
      const result = await this.service.login(dto.email, dto.password);
      this.setAuthCookies(res, result.accessToken, result.refreshToken);
      res.status(200).json({
        success: true,
        data: {
          user: result.user,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  public requestLoginOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: RequestOtpDTO = req.body;
      const result = await this.service.requestLoginOtp(dto.email);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  public verifyLoginOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: VerifyOtpDTO = req.body;
      const result = await this.service.verifyLoginOtp(dto.email, dto.otp);
      this.setAuthCookies(res, result.accessToken, result.refreshToken);
      res.status(200).json({
        success: true,
        data: {
          user: result.user,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  public refreshTokens = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies?.refreshToken || req.headers['x-refresh-token'] || req.body?.refreshToken;
      if (!refreshToken) {
        res.status(401).json({ success: false, message: 'Refresh token not found in cookies or request headers' });
        return;
      }
      const result = await this.service.refreshTokens(refreshToken as string);
      this.setAuthCookies(res, result.accessToken, result.refreshToken);
      res.status(200).json({
        success: true,
        data: {
          message: 'Token refreshed successfully',
        },
      });
    } catch (err) {
      this.clearAuthCookies(res);
      next(err);
    }
  };

  public logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies?.refreshToken || req.headers['x-refresh-token'] || req.body?.refreshToken;
      if (refreshToken) {
        await this.service.logout(refreshToken as string);
      }
      this.clearAuthCookies(res);
      res.status(200).json({
        success: true,
        data: { message: 'Logged out successfully' },
      });
    } catch (err) {
      this.clearAuthCookies(res);
      next(err);
    }
  };

  public forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: ForgotPasswordDTO = req.body;
      const result = await this.service.forgotPassword(dto);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  public resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: ResetPasswordDTO = req.body;
      const result = await this.service.resetPassword(dto);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };


  public changePassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const dto: ChangePasswordDTO = req.body;
      const result = await this.service.changePassword(userId, dto);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };
}

export const authController = new AuthController();
