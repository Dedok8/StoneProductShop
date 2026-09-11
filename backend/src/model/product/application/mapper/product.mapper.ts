import { CategoryMapper } from '@/model/category/application/mapper';
import { ProductResponseDto } from '@/model/product/application/dto';
import type { ProductEntity } from '@/model/product/domain';

export class ProductMapper {
  static toResponse(entity: ProductEntity): ProductResponseDto {
    return new ProductResponseDto({
      id: entity.id,
      name: entity.name,
      slug: entity.slug,
      description: entity.description ?? '',
      price: entity.price,
      stock: entity.stock,
      images: entity.images,
      isActive: entity.isActive,
      categoryId: entity.categoryId,
      category: CategoryMapper.toResponse(entity.category),
      productTypeId: entity.productTypeId,
      productType: entity.productType,
      originId: entity.originId,
      origin: entity.origin,
      colorId: entity.colorId,
      color: entity.color,
      ownerId: entity.ownerId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toResponseList(entities: ProductEntity[]): ProductResponseDto[] {
    return entities.map((entity) => ProductMapper.toResponse(entity));
  }
}
