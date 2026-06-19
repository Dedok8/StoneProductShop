import { OrderService } from '@modules/order/application';
import { ORDER_REPOSITORY } from '@modules/order/domain/interfaces/order-repository.interface';
import { OrderRepository } from '@modules/order/infrestructure/order.reposetory';
import { OrderController } from '@modules/order/presentation';
import { Module } from '@nestjs/common';
import { PrismaModule } from '@shared/prisma';

@Module({
  imports: [PrismaModule],
  controllers: [OrderController],
  providers: [
    OrderService,
    {
      provide: ORDER_REPOSITORY,
      useClass: OrderRepository,
    },
  ],
  exports: [OrderService],
})
export class OrderModule {}
