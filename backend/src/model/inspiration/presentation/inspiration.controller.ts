import { Controller, Get } from '@nestjs/common';

import {
  InspirationImageResponseDto,
  InspirationImageService,
} from '@/model/inspiration/application';

@Controller('inspiration')
export class InspirationController {
  constructor(
    private readonly inspirationImageService: InspirationImageService,
  ) {}

  @Get()
  getAll(): Promise<InspirationImageResponseDto[]> {
    return this.inspirationImageService.findAll();
  }
}
