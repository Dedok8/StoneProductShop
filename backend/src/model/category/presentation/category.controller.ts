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

import { CategoryService } from '@/model/category/application';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from '@/model/category/application/dto';
import { JWTAuthGuard, Roles, RolesGuard, UserRole } from '@/shared';

@Controller('category')
@ApiTags('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }


  @Get('search')
  search(@Query('slug') slug?: string, @Query('name') name?: string) {
    if (slug) return this.categoryService.findBySlug(slug);
    if (name) return this.categoryService.findByName(name);

    throw new BadRequestException(
      'Provide either "slug" or "name" query parameter',
    );
  }

  @Get(':id')
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoryService.findById(id);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UseGuards(JWTAuthGuard, RolesGuard)
  create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UseGuards(JWTAuthGuard, RolesGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(id, dto);
  }

 
  @Delete(':id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UseGuards(JWTAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoryService.delete(id);
  }
}
