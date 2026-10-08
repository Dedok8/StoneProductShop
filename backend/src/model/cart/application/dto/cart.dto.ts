import { AddToCartItemSchema, UpdateCartIteSchema } from '@stone-shop/shared';
import { createZodDto } from 'nestjs-zod';

export class AddToCartItemDto extends createZodDto(AddToCartItemSchema) {}
export class UpdateCartItemDto extends createZodDto(UpdateCartIteSchema) {}
