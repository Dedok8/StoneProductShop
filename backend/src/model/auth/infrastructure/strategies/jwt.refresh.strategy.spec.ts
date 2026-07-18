import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import type { Request } from 'express';

import type { IRefreshTokenPayload } from '@/model/auth/domain';
import { JWTRefreshStrategy } from '@/model/auth/infrastructure/strategies/jwt.refresh.strategy';

describe('JWTRefreshStrategy', () => {
  let strategy: JWTRefreshStrategy;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JWTRefreshStrategy,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue('mock-refresh-secret'),
          },
        },
      ],
    }).compile();

    strategy = module.get<JWTRefreshStrategy>(JWTRefreshStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    const mockPayload: IRefreshTokenPayload = { sub: 'user-123' };

    it('should successfully return payload enriched with token when cookie is present', () => {
      const mockRequest = {
        cookies: { refreshToken: 'valid-refresh-token' },
      } as unknown as Request;

      const result = strategy.validate(mockRequest, mockPayload);

      expect(result).toEqual({
        sub: 'user-123',
        refreshToken: 'valid-refresh-token',
      });
    });

    it('should throw UnauthorizedException when refreshToken is missing in cookies', () => {
      const mockRequest = {
        cookies: {},
      } as unknown as Request;

      expect(() => strategy.validate(mockRequest, mockPayload)).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when cookies object is completely undefined', () => {
      const mockRequest = {} as unknown as Request;

      expect(() => strategy.validate(mockRequest, mockPayload)).toThrow(
        UnauthorizedException,
      );
    });
  });
});
