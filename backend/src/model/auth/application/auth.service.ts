import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import {
  AccessTokenResponseDto,
  LoginDto,
  RegisterDto,
} from '@/model/auth/application/dto';
import { TokenService } from '@/model/auth/application/token';
import { ITokenPair } from '@/model/auth/domain';
import {
  type IUserRepository,
  USER_REPOSITORY,
  UserEntity,
} from '@/model/user';
import { HashService } from '@/shared';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly hashService: HashService,
    private readonly tokenService: TokenService,
  ) {}

  async register(dto: RegisterDto): Promise<ITokenPair> {
    await this.ensureEmailIsAvailable(dto.email);

    const passwordHash = await this.hashService.hash(dto.password);

    const user = await this.userRepository.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
    });

    return this.issueTokenPair(user);
  }

  async login(dto: LoginDto): Promise<ITokenPair> {
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isValid = await this.hashService.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    return this.issueTokenPair(user);
  }

  async refresh(
    userId: string,
    refreshToken: string,
  ): Promise<AccessTokenResponseDto> {
    const user = await this.userRepository.findById(userId);

    if (!user?.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isValid = await this.hashService.compare(
      refreshToken,
      user.refreshToken,
    );

    if (!isValid) throw new UnauthorizedException('Invalid refresh token');

    const accessToken = await this.tokenService.signAccessToken(user);

    return { accessToken };
  }

  async logout(userId: string): Promise<void> {
    await this.userRepository.update(userId, { refreshToken: null });
  }

  private async issueTokenPair(user: UserEntity): Promise<ITokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken(user),
      this.tokenService.signRefreshToken(user),
    ]);

    const refreshHash = await this.hashService.hash(refreshToken);

    await this.userRepository.update(user.id, { refreshToken: refreshHash });

    return { accessToken, refreshToken };
  }

  private async ensureEmailIsAvailable(email: string): Promise<void> {
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('Email address is already in use.');
    }
  }
}
