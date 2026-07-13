import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { Strategy } from 'passport-jwt';

import { IRefreshTokenPayload } from '@/model/auth/domain';

const REFRESH_COOKIE_NAME = 'refreshToken';

const cookieExtractor = (req: Request): string | null => {
  const cookies = req?.cookies as Record<string, string> | undefined;
  return cookies?.[REFRESH_COOKIE_NAME] ?? null;
};

@Injectable()
export class JWTRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  validate(
    req: Request,
    payload: IRefreshTokenPayload,
  ): IRefreshTokenPayload & { refreshToken: string } {
    const refreshToken = cookieExtractor(req);
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found in cookies');
    }
    return { ...payload, refreshToken };
  }
}
