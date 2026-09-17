export interface User {
  id: string;
  _id?: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN';
  mobileNumber?: string | null;
  avatarUrl?: string;
  profileImage?: string;
  profileImageUrl?: string;
  createdAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  otpSent: boolean;
  otpEmail?: string | null;
  forgotPasswordStep: 'REQUEST' | 'VERIFY' | 'SUCCESS';
}
