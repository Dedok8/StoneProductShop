import { UserMapper } from '@/model/user/application/mapper';
import { UserEntity } from '@/model/user/domain';

describe('UserMapper', () => {
  const mockDate = new Date();

  const createMockUser = (): UserEntity => {
    return new UserEntity({
      id: 'user-1',
      name: 'Ivan Ivanov',
      email: 'ivan@example.com',
      passwordHash: 'argon2_hashed_password',
      role: 'USER',
      refreshToken: 'active_refresh_token_string',
      createdAt: mockDate,
      updatedAt: mockDate,
    });
  };

  describe('toResponse', () => {
    it('should map UserEntity fields to a plain object matching UserResponseDto shape', () => {
      const entity = createMockUser();

      const result = UserMapper.toResponse(entity);

      expect(result).toEqual({
        id: 'user-1',
        name: 'Ivan Ivanov',
        email: 'ivan@example.com',
        role: 'USER',
        createdAt: mockDate,
      });
    });

    it('should strictly exclude sensitive and infrastructure fields', () => {
      const entity = createMockUser();

      const result = UserMapper.toResponse(entity);

      expect(result).not.toHaveProperty('passwordHash');
      expect(result).not.toHaveProperty('refreshToken');
      expect(result).not.toHaveProperty('updatedAt');
    });
  });

  describe('toResponseList', () => {
    it('should transform an array of UserEntity into an array of mapped plain objects', () => {
      const entities = [createMockUser(), createMockUser()];

      const result = UserMapper.toResponseList(entities);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('user-1');
      expect(result[1].email).toBe('ivan@example.com');

      expect(result[0]).not.toHaveProperty('passwordHash');
      expect(result[1]).not.toHaveProperty('passwordHash');
    });
  });
});
