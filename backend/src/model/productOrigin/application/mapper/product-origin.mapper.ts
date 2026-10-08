import type { ProductOriginsEntity } from '@/model/productOrigin/domain';

export class ProductOriginMapper {
  static toResponse(entity: ProductOriginsEntity) {
    return {
      id: entity.id,
      name: entity.name,
      slug: entity.slug,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toResponseList(entities: ProductOriginsEntity[]) {
    return entities.map((entity) => ProductOriginMapper.toResponse(entity));
  }
}
