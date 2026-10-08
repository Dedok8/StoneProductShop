import { Module } from '@nestjs/common';

import { OrderService } from '@/model/order/application';
import { ORDER_REPOSITORY } from '@/model/order/domain/interfaces';
import { OrderRepository } from '@/model/order/infrastructure';
import { OrderController } from '@/model/order/presentation';

@Module({
  controllers: [OrderController],
  providers: [
    OrderService,
    {
      provide: ORDER_REPOSITORY,
      useClass: OrderRepository,
    },
  ],
  exports: [OrderService, ORDER_REPOSITORY],
})
export class OrderModule {}
