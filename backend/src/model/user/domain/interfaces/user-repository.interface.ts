import type { UserEntity } from '@/model/user/domain/entities';
import type { SortOrder } from '@/shared/dto';
import type { UserRole } from '@/shared/guards/role/user-role';

export interface ICreateUserData {
  name: string;
  email: string;
  passwordHash: string;
  role?: UserRole;
}

export interface IUpdateUserData {
  name?: string;
  email?: string;
  passwordHash?: string;
  refreshToken?: string | null;
}


export interface IUserQuery {
  search?: string;
  sortBy?: string;
  sortOrder?: SortOrder;
  page?: number;
  limit?: number;
}

export interface IUserFindAllResult {
  items: UserEntity[];
  total: number;
}

export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findAll(query: IUserQuery): Promise<IUserFindAllResult>;
  create(data: ICreateUserData): Promise<UserEntity>;
  update(id: string, data: IUpdateUserData): Promise<UserEntity | null>;
  updateRole(id: string, role: UserRole): Promise<UserEntity | null>;
  delete(id: string): Promise<void>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
