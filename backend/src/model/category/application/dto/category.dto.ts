import {
  CategoryQuerySchema,
  CategoryQuerySearchSchema,
  CreateCategorySchema,
  UpdateCategorySchema,
} from '@stone-shop/shared';
import { createZodDto } from 'nestjs-zod';

export class CreateCategoryDto extends createZodDto(CreateCategorySchema) {}
export class UpdateCategoryDto extends createZodDto(UpdateCategorySchema) {}
export class CategoryQueryDto extends createZodDto(CategoryQuerySchema) {}
export class CategorySearchDto extends createZodDto(
  CategoryQuerySearchSchema,
) {}
