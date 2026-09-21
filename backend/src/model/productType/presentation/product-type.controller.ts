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
  CreateProductTypeDto,
  ProductTypeResponseDto,
  UpdateProductTypeDto,
} from '@/model/productType/application';
import { ProductTypeService } from '@/model/productType/application/product-type.service';
import { JWTAuthGuard, Roles, RolesGuard, UserRole } from '@/shared';

@Controller('product-type')
@ApiTags('product-type')
export class ProductTypeController {
  constructor(private readonly productTypeService: ProductTypeService) {}

  @Get()
  findAll(): Promise<ProductTypeResponseDto[]> {
    return this.productTypeService.findAll();
  }

  @Get('search')
  search(
    @Query('slug') slug?: string,
    @Query('name') name?: string,
  ): Promise<ProductTypeResponseDto | ProductTypeResponseDto[]> {
    if (slug) return this.productTypeService.findBySlug(slug);
    if (name) return this.productTypeService.findByName(name);
    throw new BadRequestException(
      'Provide either "slug" or "name" query parameter',
    );
  }

  @Get(':id')
  findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProductTypeResponseDto> {
    return this.productTypeService.findById(id);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UseGuards(JWTAuthGuard, RolesGuard)
  create(@Body() dto: CreateProductTypeDto): Promise<ProductTypeResponseDto> {
    return this.productTypeService.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UseGuards(JWTAuthGuard, RolesGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductTypeDto,
  ): Promise<ProductTypeResponseDto> {
    return this.productTypeService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.productTypeService.delete(id);
  }
}
