import type { ProductTypesEntity } from '@/model/productType/domain';

export class ProductTypeMapper {
  static toResponse(entity: ProductTypesEntity) {
    return {
      id: entity.id,
      name: entity.name,
      slug: entity.slug,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toResponseList(entities: ProductTypesEntity[]) {
    return entities.map((entity) => ProductTypeMapper.toResponse(entity));
  }
}
