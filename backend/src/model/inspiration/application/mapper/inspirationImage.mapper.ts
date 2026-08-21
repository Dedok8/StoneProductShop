import type { InspirationImageEntity } from '@/model/inspiration/domain';

export class InspirationImageMapper {
  static toResponse(entity: InspirationImageEntity) {
    return {
      id: entity.id,
      imageUrl: entity.imageUrl,
      alt: entity.alt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toResponseList(entities: InspirationImageEntity[]) {
    return entities.map((entity) => InspirationImageMapper.toResponse(entity));
  }
}
