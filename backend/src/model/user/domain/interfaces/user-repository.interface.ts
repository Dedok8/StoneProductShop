import type { SORT_ORDER, USER_ROLE } from '@stone-shop/shared';

import type { UserEntity } from '@/model/user/domain/entities';

export interface ICreateUserData {
  name: string;
  email: string;
  passwordHash: string;
  role?: USER_ROLE;
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
  sortOrder?: SORT_ORDER;
  page?: number;
  limit?: number;
}

export interface IUserFindAllResult {
  items: UserEntity[];
  total: number;
}

export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByIdWithRefreshToken(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findAll(query: IUserQuery): Promise<IUserFindAllResult>;
  search(query: string): Promise<UserEntity[]>;
  create(data: ICreateUserData): Promise<UserEntity>;
  update(id: string, data: IUpdateUserData): Promise<UserEntity | null>;
  updateRole(id: string, role: USER_ROLE): Promise<UserEntity | null>;
  delete(id: string): Promise<void>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
