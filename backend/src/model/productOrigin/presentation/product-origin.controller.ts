import {
  BadRequestException,
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
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import {
  CreateProductOriginDto,
  ProductOriginResponseDto,
  UpdateProductOriginDto,
} from '@/model/productOrigin/application';
import { ProductOriginService } from '@/model/productOrigin/application/product-origin.service';
import { JWTAuthGuard, Roles, RolesGuard, UserRole } from '@/shared';

@Controller('product-origin')
@ApiTags('product Origin')
export class ProductOriginController {
  constructor(private readonly productOriginService: ProductOriginService) {}

  @Get()
  findAll(): Promise<ProductOriginResponseDto[]> {
    return this.productOriginService.findAll();
  }

  @Get('search')
  search(
    @Query('slug') slug?: string,
    @Query('name') name?: string,
  ): Promise<ProductOriginResponseDto | ProductOriginResponseDto[]> {
    if (slug) return this.productOriginService.findBySlug(slug);
    if (name) return this.productOriginService.findByName(name);
    throw new BadRequestException(
      'Provide either "slug" or "name" query parameter',
    );
  }

  @Get(':id')
  findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProductOriginResponseDto> {
    return this.productOriginService.findById(id);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UseGuards(JWTAuthGuard, RolesGuard)
  create(
    @Body() dto: CreateProductOriginDto,
  ): Promise<ProductOriginResponseDto> {
    return this.productOriginService.create(dto);
  }

  @Patch('id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UseGuards(JWTAuthGuard, RolesGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductOriginDto,
  ): Promise<ProductOriginResponseDto> {
    return this.productOriginService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.productOriginService.delete(id);
  }
}
