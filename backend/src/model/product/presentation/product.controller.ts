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
import { USER_ROLE } from '@stone-shop/shared';

import {
  PaginatedProductResponseDto,
  ProductResponseDto,
  ProductService,
} from '@/model/product/application';
import {
  CreateProductDto,
  ProductQueryDto,
  SearchProductDto,
  UpdateProductDto,
} from '@/model/product/application/dto/product.dto';
import { CurrentUser, JWTAuthGuard, Roles, RolesGuard } from '@/shared';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  getAll(
    @Query() query: ProductQueryDto,
  ): Promise<PaginatedProductResponseDto> {
    return this.productService.findAll(query);
  }

  @Get('search')
  search(@Query() query: SearchProductDto): Promise<ProductResponseDto[]> {
    return this.productService.search(query.query);
  }

  // @Get('search/name')
  // findByName(@Query() query: FindByNameDto): Promise<ProductResponseDto> {
  //   return this.productService.findByName(query.name);
  // }

  @Get(':id')
  findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProductResponseDto> {
    return this.productService.findById(id);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(USER_ROLE.ADMIN)
  @UseGuards(JWTAuthGuard, RolesGuard)
  create(
    @Body() dto: CreateProductDto,
    @CurrentUser('sub') ownerId: string,
  ): Promise<ProductResponseDto> {
    return this.productService.create(dto, ownerId);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(USER_ROLE.ADMIN)
  @UseGuards(JWTAuthGuard, RolesGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(USER_ROLE.ADMIN)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.productService.delete(id);
  }
}
