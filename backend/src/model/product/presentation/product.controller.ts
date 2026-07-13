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
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import {
  CreateProductDto,
  PaginatedProductResponseDto,
  ProductQueryDto,
  ProductResponseDto,
  ProductService,
  UpdateProductDto,
} from '@/model/product/application';
import {
  CurrentUser,
  JWTAuthGuard,
  Roles,
  RolesGuard,
  UserRole,
} from '@/shared';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  getAll(
    @Query() query: ProductQueryDto,
  ): Promise<PaginatedProductResponseDto> {
    return this.productService.findAll(query);
  }

  @Get(':id')
  findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProductResponseDto> {
    return this.productService.findById(id);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UseGuards(JWTAuthGuard, RolesGuard)
  create(
    @Body() dto: CreateProductDto,
    @CurrentUser('sub') ownerId: string,
  ): Promise<ProductResponseDto> {
    return this.productService.create(dto, ownerId);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UseGuards(JWTAuthGuard, RolesGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.productService.delete(id);
  }
}
