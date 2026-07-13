import type { UserRole } from '@/shared/guards/role/user-role';

export interface IAccessTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface IRefreshTokenPayload {
  sub: string;
}

export interface ITokenPair {
  accessToken: string;
  refreshToken: string;
}
