import { Module } from '@nestjs/common';

import { ProductOriginService } from '@/model/productOrigin/application/product-origin.service';
import { PRODUCT_ORIGIN_REPOSITORY } from '@/model/productOrigin/domain';
import { ProductOriginRepository } from '@/model/productOrigin/infrastructure';
import { ProductOriginController } from '@/model/productOrigin/presentation';

@Module({
  controllers: [ProductOriginController],
  providers: [
    ProductOriginService,
    {
      provide: PRODUCT_ORIGIN_REPOSITORY,
      useClass: ProductOriginRepository,
    },
  ],
  exports: [ProductOriginService, PRODUCT_ORIGIN_REPOSITORY],
})
export class ProductOriginModule {}
