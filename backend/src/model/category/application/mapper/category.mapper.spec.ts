import { CategoryMapper } from '@/model/category/application/mapper';
import { CategoryEntity } from '@/model/category/domain/entities';

describe('CategoryMapper', () => {
  const mockDate = new Date();
  const mockEntity = CategoryEntity.fromPersistence({
    id: 'category-1',
    name: 'Granite',
    slug: 'granite',
    isActive: true,
    createdAt: mockDate,
    updatedAt: mockDate,
  });

  describe('toResponse', () => {
    it('should map category entity to response object', () => {
      const result = CategoryMapper.toResponse(mockEntity);

      expect(result).toEqual({
        id: 'category-1',
        name: 'Granite',
        slug: 'granite',
        isActive: true,
        createdAt: mockDate,
        updatedAt: mockDate,
      });
    });
  });

  describe('toResponseList', () => {
    it('should map an array of category entities', () => {
      const result = CategoryMapper.toResponseList([mockEntity]);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('category-1');
    });
  });
});
