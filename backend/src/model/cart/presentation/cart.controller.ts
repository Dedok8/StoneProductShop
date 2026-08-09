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
import { ApiBearerAuth } from '@nestjs/swagger';

import {
  AddCartItemDto,
  CartResponseDto,
  CartService,
  UpdateCartItemDto,
} from '@/model/cart/application';
import { CurrentUser, JWTAuthGuard, Roles, RolesGuard } from '@/shared';

@Controller('cart')
@ApiBearerAuth()
@UseGuards(JWTAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@CurrentUser('sub') userId: string): Promise<CartResponseDto> {
    return this.cartService.getCart(userId);
  }

  @Get('admin/:userId')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  getUserCartAsAdmin(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<CartResponseDto> {
    return this.cartService.getCart(userId);
  }

  @Post('items')
  addItem(
    @CurrentUser('sub') userId: string,
    @Body() dto: AddCartItemDto,
  ): Promise<CartResponseDto> {
    return this.cartService.addItem(userId, dto.productId, dto.quantity);
  }

  @Patch('items/:productId')
  updateItem(
    @CurrentUser('sub') userId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    return this.cartService.setItemQuantity(userId, productId, dto.quantity);
  }

  @Delete('items/:productId')
  removeItem(
    @CurrentUser('sub') userId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
  ): Promise<CartResponseDto> {
    return this.cartService.removeItem(userId, productId);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  clear(@CurrentUser('sub') userId: string): Promise<void> {
    return this.cartService.clear(userId);
  }
}
