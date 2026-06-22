import { UserRepository } from '@modules/user/domain';
import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  const repo = {
    findById: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UserService, { provide: UserRepository, useValue: repo }],
    }).compile();

    service = module.get(UserService);
    jest.clearAllMocks();
  });

  it('getUser not found', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(service.getUser('1')).rejects.toThrow(NotFoundException);
  });

  it('delete user success', async () => {
    repo.findById.mockResolvedValue({ id: '1' });

    await service.deleteUser('1');

    expect(repo.delete).toHaveBeenCalledWith('1');
  });
});
