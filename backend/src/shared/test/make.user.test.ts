import { USER_ROLE } from '@stone-shop/shared';

import { UserEntity } from '@/model/user';

export const makeUser = (overrides: Partial<UserEntity> = {}): UserEntity =>
  new UserEntity({
    id: 'user-1',
    name: 'Ivan',
    email: 'Ivan@example.com',
    passwordHash: 'hashed-password',
    role: USER_ROLE.USER,
    refreshToken: null,
    createdAt: new Date('2026-14-07'),
    updatedAt: new Date('2026-14-07'),
    ...overrides,
  });
