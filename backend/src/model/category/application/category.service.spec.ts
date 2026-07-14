import { ConflictException, NotFoundException } from '@nestjs/common';
import type { MockProxy } from 'jest-mock-extended';
import { mock } from 'jest-mock-extended';

import { CategoryService } from '@/model/category/application/category.service';
import { CategoryEntity } from '@/model/category/domain/entities';
import type { ICategoryRepository } from '@/model/category/domain/interfaces';

const makeCategory = (
  overrides: Partial<CategoryEntity> = {},
): CategoryEntity =>
  new CategoryEntity({
    id: 'cat-1',
    name: 'Granite',
    slug: 'granite',
    isActive: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  });

describe('CategoryService', () => {
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
    it('возвращает category, если она найдена', async () => {
      const category = makeCategory();
      repository.findById.mockResolvedValue(category);

      const result = await service.findById('cat-1');

      expect(repository.findById).toHaveBeenCalledWith('cat-1');
      expect(result).toEqual({
        id: category.id,
        name: category.name,
        slug: category.slug,
        isActive: category.isActive,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      });
    });

    it('выбрасывает NotFoundException, если category не найдена', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findBySlug', () => {
    it('возвращает category по slug', async () => {
      const category = makeCategory({ slug: 'marble' });
      repository.findBySlug.mockResolvedValue(category);

      const result = await service.findBySlug('marble');

      expect(repository.findBySlug).toHaveBeenCalledWith('marble');
      expect(result.slug).toBe('marble');
    });

    it('выбрасывает NotFoundException, если slug не найден', async () => {
      repository.findBySlug.mockResolvedValue(null);

      await expect(service.findBySlug('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByName', () => {
    it('возвращает category по имени', async () => {
      const category = makeCategory({ name: 'Limestone' });
      repository.findByName.mockResolvedValue(category);

      const result = await service.findByName('Limestone');

      expect(result.name).toBe('Limestone');
    });

    it('выбрасывает NotFoundException, если имя не найдено', async () => {
      repository.findByName.mockResolvedValue(null);

      await expect(service.findByName('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('возвращает список замапленных категорий', async () => {
      const categories = [
        makeCategory(),
        makeCategory({ id: 'cat-2', name: 'Marble', slug: 'marble' }),
      ];
      repository.findAll.mockResolvedValue(categories);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[1].name).toBe('Marble');
    });

    it('возвращает пустой массив, если категорий нет', async () => {
      repository.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    const dto = { name: 'Granite', slug: 'granite' };

    it('создаёт category, если имя и slug свободны', async () => {
      repository.findByName.mockResolvedValue(null);
      repository.findBySlug.mockResolvedValue(null);
      repository.create.mockResolvedValue(makeCategory());

      const result = await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(result.slug).toBe('granite');
    });

    it('выбрасывает ConflictException, если имя уже занято', async () => {
      repository.findByName.mockResolvedValue(makeCategory());

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('выбрасывает ConflictException, если slug уже занят', async () => {
      repository.findByName.mockResolvedValue(null);
      repository.findBySlug.mockResolvedValue(makeCategory());

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('обновляет category, если новые имя/slug свободны', async () => {
      repository.findByName.mockResolvedValue(null);
      repository.findBySlug.mockResolvedValue(null);
      repository.update.mockResolvedValue(makeCategory({ name: 'Updated' }));

      const result = await service.update('cat-1', { name: 'Updated' });

      expect(repository.update).toHaveBeenCalledWith('cat-1', {
        name: 'Updated',
      });
      expect(result.name).toBe('Updated');
    });

    it('позволяет оставить своё же имя без конфликта (excludeId)', async () => {
      const existing = makeCategory();
      repository.findByName.mockResolvedValue(existing);
      repository.update.mockResolvedValue(existing);

      await expect(
        service.update('cat-1', { name: existing.name }),
      ).resolves.toBeDefined();
    });

    it('выбрасывает ConflictException, если новое имя занято другой записью', async () => {
      repository.findByName.mockResolvedValue(
        makeCategory({ id: 'other-cat' }),
      );

      await expect(service.update('cat-1', { name: 'Taken' })).rejects.toThrow(
        ConflictException,
      );
    });

    it('выбрасывает ConflictException, если новый slug занят другой записью', async () => {
      repository.findByName.mockResolvedValue(null);
      repository.findBySlug.mockResolvedValue(
        makeCategory({ id: 'other-cat' }),
      );

      await expect(
        service.update('cat-1', { slug: 'taken-slug' }),
      ).rejects.toThrow(ConflictException);
    });

    it('выбрасывает NotFoundException, если category для обновления не существует', async () => {
      repository.update.mockResolvedValue(null);

      await expect(
        service.update('missing', { isActive: false }),
      ).rejects.toThrow(NotFoundException);
    });

    it('не проверяет уникальность, если name/slug не переданы', async () => {
      repository.update.mockResolvedValue(makeCategory({ isActive: false }));

      await service.update('cat-1', { isActive: false });

      expect(repository.findByName).not.toHaveBeenCalled();
      expect(repository.findBySlug).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('удаляет category, если она существует', async () => {
      repository.findById.mockResolvedValue(makeCategory());

      await service.delete('cat-1');

      expect(repository.delete).toHaveBeenCalledWith('cat-1');
    });

    it('выбрасывает NotFoundException и не вызывает delete, если category не найдена', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.delete('missing')).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });
});
