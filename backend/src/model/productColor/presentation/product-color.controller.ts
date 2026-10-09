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

import {
  CreateProductColorDto,
  ProductColorResponseDto,
  QueryProductColorDto,
  UpdateProductColorDto,
} from '@/model/productColor/application';
import { ProductColorService } from '@/model/productColor/application/product-color.service';
import { JWTAuthGuard, Roles, RolesGuard } from '@/shared';
import { AppError } from '@/shared/error';

@Controller('product-color')
@ApiTags('Product Color')
export class ProductColorController {
  constructor(private readonly productColorService: ProductColorService) {}

  @Get()
  findAll(
    @Query() query: QueryProductColorDto,
  ): Promise<ProductColorResponseDto[]> {
    return this.productColorService.findAll(query);
  }

  @Get('search')
  search(
    @Query('name') name?: string,
  ): Promise<ProductColorResponseDto | ProductColorResponseDto[]> {
    if (name) return this.productColorService.findByName(name);
    throw AppError.validationFail('Provide either  "name" query parameter');
  }

  @Get(':id')
  findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProductColorResponseDto> {
    return this.productColorService.findById(id);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(USER_ROLE.ADMIN)
  @UseGuards(JWTAuthGuard, RolesGuard)
  create(@Body() dto: CreateProductColorDto): Promise<ProductColorResponseDto> {
    return this.productColorService.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(USER_ROLE.ADMIN)
  @UseGuards(JWTAuthGuard, RolesGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductColorDto,
  ): Promise<ProductColorResponseDto> {
    return this.productColorService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(USER_ROLE.ADMIN)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.productColorService.delete(id);
  }
}
