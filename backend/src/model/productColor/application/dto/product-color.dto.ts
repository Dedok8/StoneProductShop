import {
  CreateProductColorSchema,
  UpdateProductColorSchema,
} from '@stone-shop/shared';
import { createZodDto } from 'nestjs-zod';

export class CreateProductColorDto extends createZodDto(
  CreateProductColorSchema,
) {}
export class UpdateProductColorDto extends createZodDto(
  UpdateProductColorSchema,
) {}
