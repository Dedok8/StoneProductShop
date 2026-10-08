import { CreateCategorySchema, UpdateCategorySchema } from '@stone-shop/shared';
import { createZodDto } from 'nestjs-zod';

export class CreateCategoryDto extends createZodDto(CreateCategorySchema) {}
export class UpdateCategoryDto extends createZodDto(UpdateCategorySchema) {}
