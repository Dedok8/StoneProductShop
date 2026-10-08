import { Injectable } from '@nestjs/common';

import type { UserResponseDto } from '@/model/user/application/dto';
import type { UserEntity } from '@/model/user/domain';

@Injectable()
export class UserMapper {
  toResponse(entity: UserEntity): UserResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      email: entity.email,
      role: entity.role,
      createdAt: entity.createdAt,
    };
  }

  toResponseList(entities: UserEntity[]): UserResponseDto[] {
    return entities.map((entity) => this.toResponse(entity));
  }
}
