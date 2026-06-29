import { UserRole } from '@modules/user/domain/user-role.enum';
import { UserEntity } from '@modules/user/domain/user.entity';

import { UserMapper } from './user.mapper';

const makeUserEntity = (
  overrides: Partial<{
    id: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    refreshToken: string | null;
    createdAt: Date;
    updatedAt: Date;
  }> = {},
): UserEntity =>
  new UserEntity(
    overrides.id ?? 'uuid-1',
    overrides.email ?? 'test@test.com',
    overrides.passwordHash ?? '$2b$10$hashed_password_value',
    overrides.role ?? UserRole.USER,
    overrides.refreshToken ?? null,
    overrides.createdAt ?? new Date('2024-01-01'),
    overrides.updatedAt ?? new Date('2024-01-02'),
  );

describe('UserMapper', () => {
  describe('toResponse', () => {
    it('маппит id, email, role, createdAt из entity в DTO', () => {
      const entity = makeUserEntity({
        id: 'uuid-abc',
        email: 'user@example.com',
        role: UserRole.ADMIN,
        createdAt: new Date('2025-06-01'),
      });

      const result = UserMapper.toResponse(entity);

      expect(result.id).toBe('uuid-abc');
      expect(result.email).toBe('user@example.com');
      expect(result.role).toBe(UserRole.ADMIN);
      expect(result.createdAt).toEqual(new Date('2025-06-01'));
    });

    it('не включает passwordHash в ответ (security)', () => {
      const entity = makeUserEntity({
        passwordHash: '$2b$10$super_secret_hash',
      });

      const result = UserMapper.toResponse(entity);

      expect(result).not.toHaveProperty('passwordHash');
    });

    it('не включает refreshToken в ответ (security)', () => {
      const entity = makeUserEntity({
        refreshToken: 'some-refresh-token-value',
      });

      const result = UserMapper.toResponse(entity);

      expect(result).not.toHaveProperty('refreshToken');
    });

    it('не включает updatedAt в ответ', () => {
      const entity = makeUserEntity();

      const result = UserMapper.toResponse(entity);

      expect(result).not.toHaveProperty('updatedAt');
    });

    it('корректно маппит роль USER', () => {
      const entity = makeUserEntity({ role: UserRole.USER });

      const result = UserMapper.toResponse(entity);

      expect(result.role).toBe(UserRole.USER);
    });

    it('корректно маппит роль ADMIN', () => {
      const entity = makeUserEntity({ role: UserRole.ADMIN });

      const result = UserMapper.toResponse(entity);

      expect(result.role).toBe(UserRole.ADMIN);
    });

    it('DTO содержит ровно 4 поля: id, email, role, createdAt', () => {
      const entity = makeUserEntity();

      const result = UserMapper.toResponse(entity);
      const keys = Object.keys(result);

      expect(keys).toHaveLength(4);
      expect(keys).toEqual(
        expect.arrayContaining(['id', 'email', 'role', 'createdAt']),
      );
    });
  });
});
