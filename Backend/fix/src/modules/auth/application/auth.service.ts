import { TokenService } from '@modules/auth/infrastructure';
import { LoginDto, RegisterDto } from '@modules/auth/presentation/dto';
import { UserRepository, UserRole } from '@modules/user/domain';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { HashService } from '@shared/services';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly hashService: HashService,
    private readonly tokenService: TokenService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await this.hashService.hash(dto.password);

    const user = await this.userRepo.create({
      email: dto.email,
      passwordHash,
      role: UserRole.USER,
    });

    return this.issueTokens(user.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await this.hashService.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokens(user.id, user.email, user.role);
  }

  async refresh(refreshToken: string) {
    let payload: { sub: string };
    try {
      payload = this.tokenService.verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userRepo.findById(payload.sub);
    if (!user?.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const matches = await this.hashService.compare(
      refreshToken,
      user.refreshToken,
    );
    if (!matches) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.issueTokens(user.id, user.email, user.role);
  }

  async logout(userId: string) {
    await this.userRepo.update(userId, { refreshToken: null });
  }

  private async issueTokens(id: string, email: string, role: UserRole) {
    const accessToken = this.tokenService.signAccessToken({
      sub: id,
      email,
      role,
    });
    const refreshToken = this.tokenService.signRefreshToken({ sub: id });

    const refreshTokenHash = await this.hashService.hash(refreshToken);
    await this.userRepo.update(id, { refreshToken: refreshTokenHash });

    return { accessToken, refreshToken };
  }
}
