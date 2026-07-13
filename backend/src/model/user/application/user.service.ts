import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import {
  ChangePasswordDto,
  CreateUserDto,
  PaginatedUsersResponseDto,
  UpdateUserDto,
  UpdateUserRoleDto,
  UserQueryDto,
} from '@/model/user/application/dto';
import { UserMapper } from '@/model/user/application/mapper';
import { IUserRepository, USER_REPOSITORY } from '@/model/user/domain';
import {
  assertFound,
  ensureUnique,
  HashService,
  PaginationMetaDto,
} from '@/shared';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly hashService: HashService,
  ) {}

  async findById(id: string) {
    const user = await this.userRepository.findById(id);

    if (!user) throw new NotFoundException('User not found');

    return UserMapper.toResponse(user);
  }

  async findByEmail(email: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new NotFoundException('User not found');
    return UserMapper.toResponse(user);
  }

  async findAll(query: UserQueryDto) {
    const { items, total } = await this.userRepository.findAll(query);

    return new PaginatedUsersResponseDto({
      items: UserMapper.toResponseList(items),
      meta: new PaginationMetaDto({
        page: query.page ?? 1,
        limit: query.limit ?? 20,
        total,
      }),
    });
  }

  async create(dto: CreateUserDto) {
    await ensureUnique(
      () => this.userRepository.findByEmail(dto.email),
      undefined,
      'Email address is already in use',
    );

    const passwordHash = await this.hashService.hash(dto.password);

    const user = await this.userRepository.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: dto.role,
    });

    return UserMapper.toResponse(user);
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = assertFound(
      await this.userRepository.update(id, dto),
      'User not found',
    );
    return UserMapper.toResponse(user);
  }

  async updateRole(id: string, dto: UpdateUserRoleDto) {
    const user = assertFound(
      await this.userRepository.updateRole(id, dto.role),
      'User not found',
    );
    return UserMapper.toResponse(user);
  }

  async delete(id: string) {
    assertFound(await this.userRepository.findById(id), 'User not found');
    await this.userRepository.delete(id);
  }

  async changePassword(id: string, dto: ChangePasswordDto): Promise<void> {
    const user = assertFound(
      await this.userRepository.findById(id),
      'User not found',
    );

    const isValid = await this.hashService.compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!isValid)
      throw new UnauthorizedException('Current password is incorrect');

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException(
        'New password must be different from the current password',
      );
    }

    const passwordHash = await this.hashService.hash(dto.newPassword);
    await this.userRepository.update(id, { passwordHash, refreshToken: null });
  }
}
