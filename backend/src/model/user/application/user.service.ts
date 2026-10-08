import { Inject, Injectable } from '@nestjs/common';
import { USER_ROLE } from '@stone-shop/shared';

import { PaginatedUsersResponseDto } from '@/model/user/application/dto';
import {
  ChangePasswordDto,
  CreateUserDto,
  UpdateUserDto,
  UpdateUserRoleDto,
  UserQueryDto,
} from '@/model/user/application/dto/user.dto';
import { UserMapper } from '@/model/user/application/mapper';
import { type IUserRepository, USER_REPOSITORY } from '@/model/user/domain';
import {
  assertFound,
  ensureUnique,
  HashService,
  PaginationMetaDto,
} from '@/shared';
import { AppError } from '@/shared/error';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly hashService: HashService,
    private readonly userMapper: UserMapper,
  ) {}

  async findById(id: string) {
    const user = await this.userRepository.findById(id);

    if (!user) throw AppError.notFound('User not found');

    return this.userMapper.toResponse(user);
  }

  async findByEmail(email: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw AppError.notFound('User not found');
    return this.userMapper.toResponse(user);
  }

  async findAll(query: UserQueryDto) {
    const { items, total } = await this.userRepository.findAll(query);

    return new PaginatedUsersResponseDto({
      items: this.userMapper.toResponseList(items),
      meta: new PaginationMetaDto({
        page: query.page ?? 1,
        limit: query.limit ?? 20,
        total,
      }),
    });
  }

  async search(query: string) {
    const users = await this.userRepository.search(query);

    return this.userMapper.toResponseList(users);
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
      role: USER_ROLE.USER,
    });

    return this.userMapper.toResponse(user);
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = assertFound(
      await this.userRepository.update(id, dto),
      'User not found',
    );
    return this.userMapper.toResponse(user);
  }

  async updateRole(id: string, dto: UpdateUserRoleDto) {
    const user = assertFound(
      await this.userRepository.updateRole(id, dto.role),
      'User not found',
    );
    return this.userMapper.toResponse(user);
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
      throw AppError.validationFail('Current password is incorrect');

    if (dto.currentPassword === dto.newPassword) {
      throw AppError.validationFail(
        'New password must be different from the current password',
      );
    }

    const passwordHash = await this.hashService.hash(dto.newPassword);
    await this.userRepository.update(id, { passwordHash, refreshToken: null });
  }
}
