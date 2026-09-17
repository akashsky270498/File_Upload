import { UserRole, UserStatus } from '../../infrastructure/postgres/models/user.model';

export interface UserProfileResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  mobileNumber?: string;
  role: UserRole;
  status: UserStatus;
  profileImage?: string;
  createdAt: string;
}

export interface UpdateProfileDTO {
  firstName?: string;
  lastName?: string;
  mobileNumber?: string;
  profileImage?: string;
}
