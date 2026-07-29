import { Module } from '@nestjs/common';

import { CartService } from '@/model/cart/application';
import { CART_REPOSITORY } from '@/model/cart/domain/interfaces';
import { CartRepository } from '@/model/cart/infrastructure';
import { CartController } from '@/model/cart/presentation';
import { ProductModule } from '@/model/product';

@Module({
  imports: [ProductModule],
  controllers: [CartController],
  providers: [
    CartService,
    { provide: CART_REPOSITORY, useClass: CartRepository },
  ],
  exports: [CartService],
})
export class CartModule {}
