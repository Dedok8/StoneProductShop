import type { UserEntity } from '@modules/user/domain/user.entity';
import type {
  CreateUserData,
  UpdateUserData,
} from '@modules/user/domain/user.types';

export abstract class UserRepository {
  abstract findById(id: string): Promise<UserEntity | null>;

  abstract findAll(): Promise<UserEntity[]>;

  abstract findByEmail(email: string): Promise<UserEntity | null>;

  abstract create(data: CreateUserData): Promise<UserEntity>;

  abstract update(id: string, data: UpdateUserData): Promise<UserEntity | null>;

  abstract delete(id: string): Promise<void>;
}
