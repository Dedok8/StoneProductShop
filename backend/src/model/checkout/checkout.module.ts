import { Module } from '@nestjs/common';

import { CheckoutController } from './presentation';

import { CartModule } from '@/model/cart';
import { OrderModule } from '@/model/order';

@Module({
  imports: [CartModule, OrderModule],
  controllers: [CheckoutController],
})
export class CheckoutModule {}
