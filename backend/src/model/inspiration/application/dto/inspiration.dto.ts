import {
  CreateInspirationImageSchema,
  UpdateInspirationImageSchema,
} from '@stone-shop/shared';
import { createZodDto } from 'nestjs-zod';

export class CreateInspirationImageDto extends createZodDto(
  CreateInspirationImageSchema,
) {}
export class UpdateInspirationImageDto extends createZodDto(
  UpdateInspirationImageSchema,
) {}
