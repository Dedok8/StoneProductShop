import type { ProductColorEntity } from '@/model/productColor/domain';

export class ProductColorMapper {
  static toResponse(entity: ProductColorEntity) {
    return {
      id: entity.id,
      name: entity.name,
      hex: entity.hex ?? null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toResponseList(entities: ProductColorEntity[]) {
    return entities.map((entity) => ProductColorMapper.toResponse(entity));
  }
}
