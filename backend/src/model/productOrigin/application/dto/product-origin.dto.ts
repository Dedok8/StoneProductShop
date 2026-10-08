import {
  CreateProductOriginSchema,
  UpdateProductOriginSchema,
} from '@stone-shop/shared';
import { createZodDto } from 'nestjs-zod';

export class CreateProductOriginDto extends createZodDto(
  CreateProductOriginSchema,
) {}
export class UpdateProductOriginDto extends createZodDto(
  UpdateProductOriginSchema,
) {}
