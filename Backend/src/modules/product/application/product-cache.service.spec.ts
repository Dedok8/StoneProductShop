import { CategoryService } from '@modules/category/application';
import type { CreateCategoryDto } from '@modules/category/application/dto';
import { CATEGORY_REPOSITORY } from '@modules/category/domain/interfaces';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

describe('CategoryService', () => {
  let service: CategoryService;

  const repo = {
    findBySlug: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CategoryService,
        { provide: CATEGORY_REPOSITORY, useValue: repo },
      ],
    }).compile();

    service = module.get(CategoryService);
    jest.clearAllMocks();
  });

  it('create success', async () => {
    repo.findBySlug.mockResolvedValue(null);
    repo.create.mockResolvedValue({ id: '1' });

    const dto = {
      name: 'Stone',
    } satisfies CreateCategoryDto;

    const res = await service.create(dto);

    expect(res).toBeDefined();
  });

  it('create conflict', async () => {
    repo.findBySlug.mockResolvedValue({ id: '1' });

    const dto = {
      name: 'Stone',
    } satisfies CreateCategoryDto;

    await expect(service.create(dto)).rejects.toThrow(ConflictException);
  });

  it('findById not found', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(service.findById('1')).rejects.toThrow(NotFoundException);
  });
});
