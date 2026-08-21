import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  CreateInspirationImageDto,
  InspirationImageResponseDto,
  InspirationImageService,
  UpdateInspirationImageDto,
} from '@/model/inspiration/application';
import { JWTAuthGuard, Roles, RolesGuard, UserRole } from '@/shared';

@Controller('admin/inspiration')
@Roles(UserRole.ADMIN)
@UseGuards(JWTAuthGuard, RolesGuard)
export class AdminInspirationController {
  constructor(
    private readonly inspirationImageService: InspirationImageService,
  ) {}

  @Get()
  getAll(): Promise<InspirationImageResponseDto[]> {
    return this.inspirationImageService.findAll();
  }

  @Post()
  create(
    @Body() dto: CreateInspirationImageDto,
  ): Promise<InspirationImageResponseDto> {
    return this.inspirationImageService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInspirationImageDto,
  ): Promise<InspirationImageResponseDto> {
    return this.inspirationImageService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.inspirationImageService.delete(id);
  }
}
