import {
  CreateProductDto,
  ProductQueryDto,
  ProductService,
  UpdateProductDto,
} from '@modules/product/application';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@shared/decorators';
import { JwtAuthGuard } from '@shared/guards';

interface IAuthenticatedUser {
  userId: string;
  role: string;
}

@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('')
  @ApiOperation({ summary: 'Get paginated list of products' })
  findMany(@Query() query: ProductQueryDto) {
    return this.productService.findMany(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by id' })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product' })
  create(
    @Body() dto: CreateProductDto,
    @CurrentUser() user: IAuthenticatedUser,
  ) {
    return this.productService.create(dto, user.userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product (admin or owner only)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser() user: IAuthenticatedUser,
  ) {
    return this.productService.update(id, dto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a product (admin or owner only)' })
  delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: IAuthenticatedUser,
  ) {
    return this.productService.delete(id, user);
  }
}
