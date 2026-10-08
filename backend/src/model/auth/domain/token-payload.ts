import type { USER_ROLE } from '@stone-shop/shared';

export interface IAccessTokenPayload {
  sub: string;
  email: string;
  role: USER_ROLE;
}

export interface IRefreshTokenPayload {
  sub: string;
}

export interface ITokenPair {
  accessToken: string;
  refreshToken: string;
}
