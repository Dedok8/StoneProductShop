import type { ProductResponseDto } from '@modules/product/application/dto/product-response.dto';
import type { ProductEntity } from '@modules/product/domain/entities';

export class ProductMapper {
  static toResponse(entity: ProductEntity): ProductResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      slug: entity.slug,
      description: entity.description,
      price: entity.price,
      stock: entity.stock,
      isInStock: entity.isInStock(),
      images: entity.images,
      categoryId: entity.categoryId,
      ownerId: entity.ownerId,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toResponseList(entities: ProductEntity[]): ProductResponseDto[] {
    return entities.map((entity) => ProductMapper.toResponse(entity));
  }
}
