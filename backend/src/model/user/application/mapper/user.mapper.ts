import type { UserResponseDto } from '@/model/user/application/dto';
import type { UserEntity } from '@/model/user/domain';

export class UserMapper {
  static toResponse(entity: UserEntity): UserResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      email: entity.email,
      role: entity.role,
      createdAt: entity.createdAt,
    };
  }

  static toResponseList(entities: UserEntity[]): UserResponseDto[] {
    return entities.map((entity) => UserMapper.toResponse(entity));
  }
}
