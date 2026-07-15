import { UserEntity } from '@/model/user';
import { UserRole } from '@/shared/guards';

export const makeUser = (overrides: Partial<UserEntity> = {}): UserEntity =>
  new UserEntity({
    id: 'user-1',
    name: 'Ivan',
    email: 'Ivan@example.com',
    passwordHash: 'hashed-password',
    role: UserRole.USER,
    refreshToken: null,
    createdAt: new Date('2026-14-07'),
    updatedAt: new Date('2026-14-07'),
    ...overrides,
  });
