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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { USER_ROLE } from '@stone-shop/shared';

import { ProductTypeResponseDto } from '@/model/productType/application';
import {
  CreateProductTypeDto,
  UpdateProductTypeDto,
} from '@/model/productType/application/dto/product-type.dto';
import { ProductTypeService } from '@/model/productType/application/product-type.service';
import { JWTAuthGuard, Roles, RolesGuard } from '@/shared';
import { AppError } from '@/shared/error';

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
    throw AppError.validationFail(
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
  @Roles(USER_ROLE.ADMIN)
  @UseGuards(JWTAuthGuard, RolesGuard)
  create(@Body() dto: CreateProductTypeDto): Promise<ProductTypeResponseDto> {
    return this.productTypeService.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(USER_ROLE.ADMIN)
  @UseGuards(JWTAuthGuard, RolesGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductTypeDto,
  ): Promise<ProductTypeResponseDto> {
    return this.productTypeService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(USER_ROLE.ADMIN)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.productTypeService.delete(id);
  }
}
