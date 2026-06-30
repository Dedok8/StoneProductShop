import { UserMapper } from '@modules/user/application/mapper/user.mapper';
import { UserRepository } from '@modules/user/domain';
import {
  ChangePasswordDto,
  UpdateUserDto,
} from '@modules/user/presentation/dto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { HashService } from '@shared/services';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly hashService: HashService,
  ) {}

  async findById(id: string) {
    const user = await this.userRepo.findById(id);

    if (!user) throw new NotFoundException('User not found');

    return UserMapper.toResponse(user);
  }

  async getAllUsers() {
    const users = await this.userRepo.findAll();

    return users.map((user) => UserMapper.toResponse(user));
  }

  async update(id: string, data: UpdateUserDto) {
    const user = await this.userRepo.update(id, data);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return UserMapper.toResponse(user);
  }

  async delete(id: string) {
    const user = await this.userRepo.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepo.delete(id);
  }

  async changePassword(id: string, dto: ChangePasswordDto) {
    const user = await this.userRepo.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isValid = await this.hashService.compare(
      dto.currentPassword,
      user.passwordHash,
    );

    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException(
        'New password must be different from the current password',
      );
    }

    const passwordHash = await this.hashService.hash(dto.newPassword);

    await this.userRepo.update(id, { passwordHash, refreshToken: null });
  }
}
