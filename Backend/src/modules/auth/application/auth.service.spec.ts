import { TokenService } from '@modules/auth/infrastructure';
import { UserRepository, UserRole } from '@modules/user/domain';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { HashService } from '@shared/services';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  const userRepo = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  const hashService = {
    hash: jest.fn(),
    compare: jest.fn(),
  };

  const tokenService = {
    signAccessToken: jest.fn(),
    signRefreshToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepository, useValue: userRepo },
        { provide: HashService, useValue: hashService },
        { provide: TokenService, useValue: tokenService },
      ],
    }).compile();

    service = module.get(AuthService);
    jest.clearAllMocks();
  });

  it('register - success', async () => {
    userRepo.findByEmail.mockResolvedValue(null);
    userRepo.create.mockResolvedValue({
      id: '1',
      email: 'test@test.com',
      role: UserRole.USER,
    });

    hashService.hash.mockResolvedValue('hash');
    tokenService.signAccessToken.mockReturnValue('a');
    tokenService.signRefreshToken.mockReturnValue('r');

    const res = await service.register({
      name: 'Ivan',
      email: 'test@test.com',
      password: '123',
    });

    expect(res).toEqual({ accessToken: 'a', refreshToken: 'r' });
  });

  it('register - conflict', async () => {
    userRepo.findByEmail.mockResolvedValue({ id: '1' });

    await expect(
      service.register({ name: 'Ivan', email: 'test', password: '123' }),
    ).rejects.toThrow(ConflictException);
  });

  it('login - invalid user', async () => {
    userRepo.findByEmail.mockResolvedValue(null);

    await expect(service.login({ email: 'a', password: 'b' })).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('login - wrong password', async () => {
    userRepo.findByEmail.mockResolvedValue({
      passwordHash: 'x',
      role: UserRole.USER,
    });

    hashService.compare.mockResolvedValue(false);

    await expect(service.login({ email: 'a', password: 'b' })).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
