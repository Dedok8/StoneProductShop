import { BadRequestException } from '@nestjs/common';
import { mock, type MockProxy } from 'jest-mock-extended';

import type { CategoryService } from '@/model/category/application';
import type { UpdateCategoryDto } from '@/model/category/application/dto';
import { CategoryController } from '@/model/category/presentation/category.controller';


describe('categoryController', () => {
  let controller: CategoryController;
  let service: MockProxy<CategoryService>;

  const mockCategoryResponse = { id: 'category-1', name: 'Granite' };

  beforeEach(() => {
    service = mock<CategoryService>();
    controller = new CategoryController(service);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('findAll', () => {
    it('delegates to categoryService.findAll', async () => {
      service.findAll.mockResolvedValue([mockCategoryResponse] as never);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith();
      expect(result).toEqual([mockCategoryResponse]);
    });
  });

  describe('search', () => {
    it('searches by slug if a slug query param is provided', async () => {
      service.findBySlug.mockResolvedValue(mockCategoryResponse as never);

      const result = await controller.search('granite', undefined);

      expect(service.findBySlug).toHaveBeenCalledWith('granite');
      expect(service.findByName).not.toHaveBeenCalled();
      expect(result).toBe(mockCategoryResponse);
    });

    it('searches by name if a name query param is provided and slug is not', async () => {
      service.findByName.mockResolvedValue(mockCategoryResponse as never);

      const result = await controller.search(undefined, 'Granite');

      expect(service.findByName).toHaveBeenCalledWith('Granite');
      expect(service.findBySlug).not.toHaveBeenCalled();
      expect(result).toBe(mockCategoryResponse);
    });

    it('prefers slug over name if both query params are provided', async () => {
      service.findBySlug.mockResolvedValue(mockCategoryResponse as never);

      await controller.search('granite', 'Granite');

      expect(service.findBySlug).toHaveBeenCalledWith('granite');
      expect(service.findByName).not.toHaveBeenCalled();
    });

    it('throws a BadRequestException if neither slug nor name is provided', () => {
      expect(() => controller.search(undefined, undefined)).toThrow(
        BadRequestException,
      );
      expect(service.findBySlug).not.toHaveBeenCalled();
      expect(service.findByName).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('delegates to categoryService.findById', async () => {
      service.findById.mockResolvedValue(mockCategoryResponse as never);

      const result = await controller.findById('category-1');

      expect(service.findById).toHaveBeenCalledWith('category-1');
      expect(result).toBe(mockCategoryResponse);
    });
  });

  describe('create', () => {
    it('delegates to categoryService.create with the dto', async () => {
      const dto = { name: 'Granite', slug: 'granite' };
      service.create.mockResolvedValue(mockCategoryResponse as never);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(mockCategoryResponse);
    });
  });

  describe('update', () => {
    it('delegates to categoryService.update with the id and dto', async () => {
      const dto = { name: 'Updated' } as UpdateCategoryDto;
      service.update.mockResolvedValue(mockCategoryResponse as never);

      const result = await controller.update('category-1', dto);

      expect(service.update).toHaveBeenCalledWith('category-1', dto);
      expect(result).toBe(mockCategoryResponse);
    });
  });

  describe('delete', () => {
    it('delegates to categoryService.delete with the id', async () => {
      await controller.delete('category-1');

      expect(service.delete).toHaveBeenCalledWith('category-1');
    });
  });
});
