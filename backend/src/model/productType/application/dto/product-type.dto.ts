import {
  CreateProductTypeSchema,
  UpdateProductTypeSchema,
} from '@stone-shop/shared';
import { createZodDto } from 'nestjs-zod';

export class CreateProductTypeDto extends createZodDto(
  CreateProductTypeSchema,
) {}
export class UpdateProductTypeDto extends createZodDto(
  UpdateProductTypeSchema,
) {}
