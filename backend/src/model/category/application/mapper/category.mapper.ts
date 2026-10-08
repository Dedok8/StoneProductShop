import type { CategoryEntity } from '@/model/category/domain/entities';

export class CategoryMapper {
  static toResponse(entity: CategoryEntity) {
    return {
      id: entity.id,
      name: entity.name,
      slug: entity.slug,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toResponseList(entities: CategoryEntity[]) {
    return entities.map((entity) => CategoryMapper.toResponse(entity));
  }
}
