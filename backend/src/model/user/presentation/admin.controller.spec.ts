import { mock, type MockProxy } from 'jest-mock-extended';

import type {
  CreateUserDto,
  UpdateUserDto,
  UpdateUserRoleDto,
  UserQueryDto,
  UserService,
} from '@/model/user/application';
import { AdminController } from '@/model/user/presentation';
import { UserRole } from '@/shared/guards/role/user-role';

describe('adminController', () => {
  let controller: AdminController;
  let service: MockProxy<UserService>;

  const mockUserResponse = {
    id: 'user-1',
    name: 'Ivan',
    email: 'ivan@example.com',
    role: UserRole.USER,
  };
  const mockPaginatedResponse = { items: [mockUserResponse], total: 1 };

  beforeEach(() => {
    service = mock<UserService>();
    controller = new AdminController(service);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getAll', () => {
    it('delegates to userService.findAll with the raw query', async () => {
      const query = { page: 1, limit: 20 } as UserQueryDto;
      service.findAll.mockResolvedValue(mockPaginatedResponse as never);

      const result = await controller.getAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result).toBe(mockPaginatedResponse);
    });
  });

  describe('findByEmail', () => {
    it('delegates to userService.findByEmail with the email from the query', async () => {
      const query = { email: 'ivan@example.com' };
      service.findByEmail.mockResolvedValue(mockUserResponse as never);

      const result = await controller.findByEmail(query);

      expect(service.findByEmail).toHaveBeenCalledWith('ivan@example.com');
      expect(result).toBe(mockUserResponse);
    });
  });

  describe('findUserById', () => {
    it('delegates to userService.findById with the id', async () => {
      service.findById.mockResolvedValue(mockUserResponse as never);

      const result = await controller.findUserById('user-1');

      expect(service.findById).toHaveBeenCalledWith('user-1');
      expect(result).toBe(mockUserResponse);
    });
  });

  describe('updateUser', () => {
    it('delegates to userService.update with the id and dto', async () => {
      const dto = { name: 'Updated' } as UpdateUserDto;
      service.update.mockResolvedValue(mockUserResponse as never);

      const result = await controller.updateUser('user-1', dto);

      expect(service.update).toHaveBeenCalledWith('user-1', dto);
      expect(result).toBe(mockUserResponse);
    });
  });

  describe('updateRole', () => {
    it('delegates to userService.updateRole with the id and dto', async () => {
      const dto = { role: UserRole.ADMIN } as UpdateUserRoleDto;
      service.updateRole.mockResolvedValue({
        ...mockUserResponse,
        role: UserRole.ADMIN,
      } as never);

      const result = await controller.updateRole('user-1', dto);

      expect(service.updateRole).toHaveBeenCalledWith('user-1', dto);
      expect(result).toEqual(expect.objectContaining({ role: UserRole.ADMIN }));
    });
  });

  describe('createUser', () => {
    it('delegates to userService.create with the dto', async () => {
      const dto = {
        name: 'New Admin',
        email: 'new-admin@example.com',
        password: '!Password123',
      } as CreateUserDto;
      service.create.mockResolvedValue(mockUserResponse as never);

      const result = await controller.createUser(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(mockUserResponse);
    });
  });

  describe('deleteUser', () => {
    it('delegates to userService.delete with the id', async () => {
      await controller.deleteUser('user-1');

      expect(service.delete).toHaveBeenCalledWith('user-1');
    });
  });
});
