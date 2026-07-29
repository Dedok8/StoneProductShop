import {
  BadRequestException,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { CartService } from '@/model/cart/application';
import { OrderService } from '@/model/order/application';
import { OrderResponse } from '@/model/order/application/dto';
import { CurrentUser, JWTAuthGuard } from '@/shared';

@Controller('checkout')
export class CheckoutController {
  constructor(
    private readonly cartService: CartService,
    private readonly orderService: OrderService,
  ) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  async checkout(@CurrentUser('sub') userId: string): Promise<OrderResponse> {
    const items = await this.cartService.getRawItems(userId);

    if (items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const order = await this.orderService.create(userId, { items });
    await this.cartService.clear(userId);

    return order;
  }
}
