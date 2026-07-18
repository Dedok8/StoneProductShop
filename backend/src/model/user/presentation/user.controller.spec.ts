import { mock, type MockProxy } from 'jest-mock-extended';

import type { UpdateUserDto, UserService } from '@/model/user/application';
import { UserController } from '@/model/user/presentation';

describe('userController', () => {
  let controller: UserController;
  let service: MockProxy<UserService>;

  const mockUserResponse = {
    id: 'user-1',
    name: 'Ivan',
    email: 'ivan@example.com',
  };

  beforeEach(() => {
    service = mock<UserService>();
    controller = new UserController(service);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getMe', () => {
    it('delegates to userService.findById with the current user id', async () => {
      service.findById.mockResolvedValue(mockUserResponse as never);

      const result = await controller.getMe('user-1');

      expect(service.findById).toHaveBeenCalledWith('user-1');
      expect(result).toBe(mockUserResponse);
    });
  });

  describe('update', () => {
    it('delegates to userService.update, scoped to the current user id', async () => {
      const dto = { name: 'Updated' } as UpdateUserDto;
      service.update.mockResolvedValue({
        ...mockUserResponse,
        name: 'Updated',
      } as never);

      const result = await controller.update('user-1', dto);

      expect(service.update).toHaveBeenCalledWith('user-1', dto);
      expect(result).toEqual(expect.objectContaining({ name: 'Updated' }));
    });
  });

  describe('changePassword', () => {
    it('delegates to userService.changePassword with the current user id and dto', async () => {
      const dto = {
        currentPassword: '!OldPassword123',
        newPassword: '!NewPassword456',
      };

      await controller.changePassword('user-1', dto);

      expect(service.changePassword).toHaveBeenCalledWith('user-1', dto);
    });
  });

  describe('delete', () => {
    it('delegates to userService.delete with the current user id', async () => {
      await controller.delete('user-1');

      expect(service.delete).toHaveBeenCalledWith('user-1');
    });
  });
});
