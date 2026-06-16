import { UserEntity } from './user.entity';

export abstract class UserRepository {
  abstract findById(id: string): Promise<UserEntity | null>;

  abstract findAll(): Promise<UserEntity[]>;

  abstract findByEmail(email: string): Promise<UserEntity | null>;

  abstract create(data: Partial<UserEntity>): Promise<UserEntity>;

  abstract update(
    id: string,
    data: Partial<UserEntity>,
  ): Promise<UserEntity | null>;

  abstract delete(id: string): Promise<void>;
}
