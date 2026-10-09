import {
  CreateProductColorSchema,
  ProductColorQuerySchema,
  UpdateProductColorSchema,
} from '@stone-shop/shared';
import { createZodDto } from 'nestjs-zod';

export class CreateProductColorDto extends createZodDto(
  CreateProductColorSchema,
) {}
export class UpdateProductColorDto extends createZodDto(
  UpdateProductColorSchema,
) {}

export class QueryProductColorDto extends createZodDto(
  ProductColorQuerySchema,
) {}
