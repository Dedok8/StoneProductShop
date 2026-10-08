import {
  CreateProductSchema,
  ProductImageInputSchema,
  ProductQuerySchema,
  SearchProductSchema,
  UpdateProductSchema,
} from '@stone-shop/shared';
import { createZodDto } from 'nestjs-zod';

export class SearchProductDto extends createZodDto(SearchProductSchema) {}
export class ProductQueryDto extends createZodDto(ProductQuerySchema) {}
export class CreateProductDto extends createZodDto(CreateProductSchema) {}
export class ProductImageInputDto extends createZodDto(
  ProductImageInputSchema,
) {}
export class UpdateProductDto extends createZodDto(UpdateProductSchema) {}
