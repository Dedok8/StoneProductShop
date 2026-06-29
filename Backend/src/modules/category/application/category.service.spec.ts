import { CATEGORY_REPOSITORY } from '@modules/category/domain/interfaces';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { CategoryService } from './category.service';

const makeCategory = (overrides = {}) => ({
  id: 'cat-1',
  name: 'Natural Stone',
  slug: 'natural-stone-abc12345',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeCreateDto = (overrides = {}) => ({
  name: 'Natural Stone',
  ...overrides,
});

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

  describe('create', () => {
    it('успешно создаёт категорию', async () => {
      repo.findBySlug.mockResolvedValue(null);
      repo.create.mockResolvedValue(makeCategory());

      const result = await service.create(makeCreateDto());

      expect(result).toBeDefined();
    });

    it('генерирует slug из name с UUID суффиксом', async () => {
      repo.findBySlug.mockResolvedValue(null);
      repo.create.mockResolvedValue(makeCategory());

      await service.create(makeCreateDto({ name: 'Natural Stone' }));

      const [createArg] = repo.create.mock.calls[0] as [{ slug: string }];
      expect(createArg.slug).toMatch(/^natural-stone-[a-f0-9]{8}$/);
    });

    it('slug в нижнем регистре', async () => {
      repo.findBySlug.mockResolvedValue(null);
      repo.create.mockResolvedValue(makeCategory());

      await service.create(makeCreateDto({ name: 'MARBLE FLOOR' }));

      const [createArg] = repo.create.mock.calls[0] as [{ slug: string }];
      expect(createArg.slug).toMatch(/^marble-floor-/);
    });

    it('slug заменяет пробелы на дефисы', async () => {
      repo.findBySlug.mockResolvedValue(null);
      repo.create.mockResolvedValue(makeCategory());

      await service.create(makeCreateDto({ name: 'Black Granite Stone' }));

      const [createArg] = repo.create.mock.calls[0] as [{ slug: string }];
      expect(createArg.slug).toMatch(/^black-granite-stone-/);
    });

    it('ConflictException если slug уже занят', async () => {
      repo.findBySlug.mockResolvedValue(makeCategory());

      await expect(service.create(makeCreateDto())).rejects.toThrow(
        ConflictException,
      );
    });

    it('не вызывает create при конфликте', async () => {
      repo.findBySlug.mockResolvedValue(makeCategory());

      await service.create(makeCreateDto()).catch(() => undefined);

      expect(repo.create).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('возвращает категорию по id', async () => {
      repo.findById.mockResolvedValue(makeCategory());

      const result = await service.findById('cat-1');

      expect(result.id).toBe('cat-1');
    });

    it('NotFoundException если категория не найдена', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.findById('ghost')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findMany', () => {
    it('возвращает список с пагинацией', async () => {
      repo.findMany.mockResolvedValue({
        items: [makeCategory()],
        total: 1,
      });

      const result = await service.findMany({ page: 1, limit: 10, skip: 0 });

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('передаёт skip и take в репозиторий', async () => {
      repo.findMany.mockResolvedValue({ items: [], total: 0 });

      await service.findMany({ page: 2, limit: 5, skip: 5 });

      expect(repo.findMany).toHaveBeenCalledWith({ skip: 5, take: 5 });
    });
  });

  describe('update', () => {
    it('успешно обновляет категорию', async () => {
      repo.findById.mockResolvedValue(makeCategory());
      repo.update.mockResolvedValue(makeCategory({ name: 'Updated' }));

      const result = await service.update('cat-1', { name: 'Updated' });

      expect(result.name).toBe('Updated');
    });

    it('обновляет slug если изменилось name', async () => {
      repo.findById.mockResolvedValue(makeCategory());
      repo.update.mockResolvedValue(makeCategory());

      await service.update('cat-1', { name: 'New Name' });

      const [, updateArg] = repo.update.mock.calls[0] as [
        string,
        Record<string, unknown>,
      ];
      expect(updateArg.slug).toMatch(/^new-name-[a-f0-9]{8}$/);
    });

    it('НЕ обновляет slug если name не передан', async () => {
      repo.findById.mockResolvedValue(makeCategory());
      repo.update.mockResolvedValue(makeCategory());

      await service.update('cat-1', {});

      const [, updateArg] = repo.update.mock.calls[0] as [
        string,
        Record<string, unknown>,
      ];
      expect(updateArg).not.toHaveProperty('slug');
    });

    it('NotFoundException если категория не найдена', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.update('ghost', { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('успешно удаляет категорию', async () => {
      repo.findById.mockResolvedValue(makeCategory());

      await expect(service.delete('cat-1')).resolves.not.toThrow();

      expect(repo.delete).toHaveBeenCalledWith('cat-1');
    });

    it('NotFoundException если категория не найдена', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.delete('ghost')).rejects.toThrow(NotFoundException);
    });

    it('не вызывает delete если не найдена', async () => {
      repo.findById.mockResolvedValue(null);

      await service.delete('ghost').catch(() => undefined);

      expect(repo.delete).not.toHaveBeenCalled();
    });
  });
});
