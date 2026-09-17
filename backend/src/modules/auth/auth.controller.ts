import { Request, Response, NextFunction } from 'express';
import { authService, AuthService } from './auth.service';
import { RegisterDTO, LoginDTO, RequestOtpDTO, VerifyOtpDTO, RefreshTokenDTO } from './auth.interface';

export class AuthController {
  constructor(private readonly service: AuthService = authService) {}

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
      res.status(200).json({
        success: true,
        data: result,
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
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  public refreshTokens = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: RefreshTokenDTO = req.body;
      const result = await this.service.refreshTokens(dto.refreshToken);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  public logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: RefreshTokenDTO = req.body;
      const result = await this.service.logout(dto.refreshToken);
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
