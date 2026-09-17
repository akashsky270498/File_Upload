import { UserRole } from '../../infrastructure/postgres/models/user.model';

export interface RegisterDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RequestOtpDTO {
  email: string;
}

export interface VerifyOtpDTO {
  email: string;
  otp: string;
}

export interface RefreshTokenDTO {
  refreshToken: string;
}

export interface UserAuthProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  mobileNumber?: string;
  profileImage?: string;
}

export interface AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
  user: UserAuthProfile;
}

export interface TokenPairResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ForgotPasswordDTO {
  email: string;
}

export interface ResetPasswordDTO {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}
