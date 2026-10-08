import { CreateLeadSchema, LeadQuerySchema } from '@stone-shop/shared';
import { createZodDto } from 'nestjs-zod';

export class CreateLeadDto extends createZodDto(CreateLeadSchema) {}
export class LeadQueryDto extends createZodDto(LeadQuerySchema) {}
