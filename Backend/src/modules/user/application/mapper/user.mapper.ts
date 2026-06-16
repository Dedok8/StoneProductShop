import { UserEntity } from '@modules/user/domain';
import { UserResponseDto } from '@modules/user/presentation';

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
