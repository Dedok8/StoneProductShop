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
      categoryId: entity.categoryId,
    });
  }

  static toResponseList(entities: ProductEntity[]): ProductResponseDto[] {
    return entities.map((entity) => ProductMapper.toResponse(entity));
  }
}
