import { ConflictException, NotFoundException } from '@nestjs/common';
import { mock, type MockProxy } from 'jest-mock-extended';

import { CategoryService } from '@/model/category/application/category.service';
import { CategoryEntity } from '@/model/category/domain/entities';
import type { ICategoryRepository } from '@/model/category/domain/interfaces';

const makeCategory = (
  overrides: Partial<CategoryEntity> = {},
): CategoryEntity =>
  new CategoryEntity({
    id: 'category-1',
    name: 'Granite',
    slug: 'granite',
    isActive: true,
    createdAt: new Date('2026-07-15'),
    updatedAt: new Date('2026-07-15'),
    ...overrides,
  });

describe('categoryService', () => {
  let service: CategoryService;
  let repository: MockProxy<ICategoryRepository>;

  beforeEach(() => {
    repository = mock<ICategoryRepository>();
    service = new CategoryService(repository);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('findById', () => {
    it('returns the category if it is found', async () => {
      const category = makeCategory();

      repository.findById.mockResolvedValue(category);

      const result = await service.findById('category-1');

      expect(repository.findById).toHaveBeenCalledWith('category-1');
      expect(result).toEqual({
        id: category.id,
        name: category.name,
        slug: category.slug,
        isActive: category.isActive,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      });
    });

    it('throws a NotFoundException if the category is not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findBySlug', () => {
    it('returns the slug if it is found', async () => {
      const category = makeCategory();

      repository.findBySlug.mockResolvedValue(category);

      const result = await service.findBySlug('marble');

      expect(repository.findBySlug).toHaveBeenCalledWith('marble');
      expect(result.slug).toBe('marble');
    });

    it('throws a NotFoundException if the slug is not found', async () => {
      repository.findBySlug.mockResolvedValue(null);

      await expect(service.findBySlug('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByName', () => {
    it('returns the name if it is found', async () => {
      const category = makeCategory({ name: 'Limestone' });

      repository.findByName.mockResolvedValue(category);

      const result = await service.findByName('Limestone');

      expect(repository.findByName).toHaveBeenCalledWith('Limestone');
      expect(result.name).toBe('Limestone');
    });
    it('throws a NotFoundException if the name is not found', async () => {
      repository.findByName.mockResolvedValue(null);

      await expect(service.findByName('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('returns a list of mapped categories', async () => {
      const categories = [
        makeCategory(),
        makeCategory({ id: 'category-2', name: 'Marble', slug: 'marble' }),
      ];

      repository.findAll.mockResolvedValue(categories);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[1].name).toBe('Marble');
    });

    it('returns an empty array if there are no categories', async () => {
      repository.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    const dto = { name: 'Granite', slug: 'granite' };

    it('creates a category if the name and slug are available', async () => {
      repository.findByName.mockResolvedValue(null);
      repository.findBySlug.mockResolvedValue(null);
      repository.create.mockResolvedValue(makeCategory());

      const result = await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(result.slug).toBe('granite');
    });

    it('throws a ConflictException if the name is already taken', async () => {
      repository.findByName.mockResolvedValue(makeCategory());

      await expect(service.create(dto)).rejects.toThrow(ConflictException);

      expect(repository.create).not.toHaveBeenCalled();
    });

    it('throws a ConflictException if the slug is already taken', async () => {
      repository.findBySlug.mockResolvedValue(makeCategory());

      await expect(service.create(dto)).rejects.toThrow(ConflictException);

      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('updates the category if the new name/slug is available', async () => {
      repository.findByName.mockResolvedValue(null);
      repository.findBySlug.mockResolvedValue(null);
      repository.update.mockResolvedValue(makeCategory({ name: 'Updated' }));

      const result = await service.update('category-1', { name: 'Updated' });

      expect(repository.update).toHaveBeenCalledWith('category-1', {
        name: 'Updated',
      });
      expect(result.name).toBe('Updated');
    });

    it('allows you to keep your own name without causing a conflict (excludeId)', async () => {
      const existing = makeCategory();

      repository.findByName.mockResolvedValue(existing);
      repository.update.mockResolvedValue(existing);

      await expect(
        service.update('category-1', { name: existing.name }),
      ).resolves.toBeDefined();
    });

    it('throws a ConflictException if the new name is already taken by another record', async () => {
      repository.findByName.mockResolvedValue(makeCategory({ id: 'other-id' }));

      await expect(
        service.update('category-1', { name: 'Taken' }),
      ).rejects.toThrow(ConflictException);
    });

    it('throws a ConflictException if the new slug is already taken by another record', async () => {
      repository.findByName.mockResolvedValue(null);
      repository.findBySlug.mockResolvedValue(
        makeCategory({ id: 'other-category' }),
      );

      await expect(
        service.update('category-1', { slug: 'taken-slug' }),
      ).rejects.toThrow(ConflictException);
    });

    it('throws a NotFoundException if the category to be updated does not exist', async () => {
      repository.update.mockResolvedValue(null);

      await expect(
        service.update('missing', { isActive: false }),
      ).rejects.toThrow(NotFoundException);
    });

    it('does not check for uniqueness if name/slug are not provided', async () => {
      repository.update.mockResolvedValue(makeCategory({ isActive: false }));

      await service.update('category-1', { isActive: false });

      expect(repository.findByName).not.toHaveBeenCalled();
      expect(repository.findBySlug).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('deletes the category, if it exists', async () => {
      repository.findById.mockResolvedValue(makeCategory());

      await service.delete('category-1');

      expect(repository.delete).toHaveBeenCalledWith('category-1');
    });

    it('throws a NotFoundException and does not call `delete` if the category is not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.delete('missing')).rejects.toThrow(
        NotFoundException,
      );

      expect(repository.delete).not.toHaveBeenCalled();
    });
  });
});
