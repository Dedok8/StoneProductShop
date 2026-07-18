import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';

import type { IAccessTokenPayload } from '@/model/auth/domain';
import { JWTAccessStrategy } from '@/model/auth/infrastructure/strategies/jwt-access.strategy';

describe('JWTAccessStrategy', () => {
  let strategy: JWTAccessStrategy;
  let configService: ConfigService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JWTAccessStrategy,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue('mock-access-secret'),
          },
        },
      ],
    }).compile();

    strategy = module.get<JWTAccessStrategy>(JWTAccessStrategy);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return the payload unchanged', () => {
      const mockPayload: IAccessTokenPayload = {
        sub: 'user-123',
        email: 'test@example.com',
        role: 'USER',
      };

      const result = strategy.validate(mockPayload);

      expect(result).toEqual(mockPayload);
    });
  });
});
