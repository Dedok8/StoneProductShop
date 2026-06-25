import type { UserRole } from '@modules/user/domain';

export interface AccessTokenPayload {
  // id: string;
  sub: string;
  email: string;
  role: UserRole;
}

export interface RefreshTokenPayload {
  sub: string;
}
