import type { UserEntity } from '@modules/user/domain';
import type { UserResponseDto } from '@modules/user/presentation';

export class UserMapper {
  static toResponse(entity: UserEntity): UserResponseDto {
    return {
      id: entity.id,
      email: entity.email,
      role: entity.role,
      createdAt: entity.createdAt,
    };
  }
}
