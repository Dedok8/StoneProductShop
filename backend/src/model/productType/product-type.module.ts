import { Module } from '@nestjs/common';

import { ProductTypeService } from '@/model/productType/application/product-type.service';
import { PRODUCT_TYPE_REPOSITORY } from '@/model/productType/domain';
import { ProductTypeRepository } from '@/model/productType/infrastructure';
import { ProductTypeController } from '@/model/productType/presentation';

@Module({
  controllers: [ProductTypeController],
  providers: [
    ProductTypeService,
    {
      provide: PRODUCT_TYPE_REPOSITORY,
      useClass: ProductTypeRepository,
    },
  ],
  exports: [ProductTypeService, PRODUCT_TYPE_REPOSITORY],
})

export class ProductTypeModule {}
