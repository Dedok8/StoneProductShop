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

import { CategoryService } from '@/model/category/application';
import {
  CategoryResponseDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '@/model/category/application/dto';
import { JWTAuthGuard, Roles, RolesGuard } from '@/shared';
import { AppError } from '@/shared/error';

@Controller('category')
@ApiTags('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  findAll(): Promise<CategoryResponseDto[]> {
    return this.categoryService.findAll();
  }

  @Get('search')
  search(
    @Query('slug') slug?: string,
    @Query('name') name?: string,
  ): Promise<CategoryResponseDto | CategoryResponseDto[]> {
    if (slug) return this.categoryService.findBySlug(slug);
    if (name) return this.categoryService.findByName(name);
    throw AppError.validationFail(
      'Provide either "slug" or "name" query parameter',
    );
  }

  @Get(':id')
  findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CategoryResponseDto> {
    return this.categoryService.findById(id);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(USER_ROLE.ADMIN)
  @UseGuards(JWTAuthGuard, RolesGuard)
  create(@Body() dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    return this.categoryService.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(USER_ROLE.ADMIN)
  @UseGuards(JWTAuthGuard, RolesGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.categoryService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(USER_ROLE.ADMIN)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoryService.delete(id);
  }
}
