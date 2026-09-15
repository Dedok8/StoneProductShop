import { Module } from '@nestjs/common';

import { ProductColorService } from '@/model/productColor/application/product-color.service';
import { PRODUCT_COLOR_REPOSITORY } from '@/model/productColor/domain';
import { ProductColorRepository } from '@/model/productColor/infrastructure';
import { ProductColorController } from '@/model/productColor/presentation';

@Module({
  controllers: [ProductColorController],
  providers: [
    ProductColorService,
    {
      provide: PRODUCT_COLOR_REPOSITORY,
      useClass: ProductColorRepository,
    },
  ],
  exports: [ProductColorService, PRODUCT_COLOR_REPOSITORY],
})

export class ProductColorModule {}
