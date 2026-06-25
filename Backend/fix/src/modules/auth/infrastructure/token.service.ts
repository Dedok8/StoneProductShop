import { AccessTokenPayload, RefreshTokenPayload } from '@modules/auth/domain';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { SignOptions } from 'jsonwebtoken';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  signAccessToken(payload: AccessTokenPayload): string {
    return this.jwt.sign(payload, {
      secret: this.config.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get<string>(
        'JWT_ACCESS_EXPIRES_IN',
        '15m',
      ) as SignOptions['expiresIn'],
    });
  }

  signRefreshToken(payload: RefreshTokenPayload): string {
    return this.jwt.sign(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get<string>(
        'JWT_REFRESH_EXPIRES_IN',
        '7d',
      ) as SignOptions['expiresIn'],
    });
  }

  verifyRefreshToken(token: string): RefreshTokenPayload {
    return this.jwt.verify(token, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
    });
  }
}
