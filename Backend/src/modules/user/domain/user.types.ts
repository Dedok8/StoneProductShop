import { UserRole } from './user-role.enum';

export interface CreateUserData {
  email: string;
  passwordHash: string;
  role?: UserRole;
}

export interface UpdateUserData {
  email?: string;
  passwordHash?: string;
  refreshToken?: string | null;
}
