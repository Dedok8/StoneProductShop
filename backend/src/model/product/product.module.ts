import { Module } from '@nestjs/common';

import { CategoryModule } from '@/model/category';
import { ProductService } from '@/model/product/application';
import { PRODUCT_REPOSITORY } from '@/model/product/domain';
import { ProductRepository } from '@/model/product/infrastructure/product.repository';
import { ProductController } from '@/model/product/presentation';

@Module({
  imports: [CategoryModule],
  controllers: [ProductController],
  providers: [
    ProductService,
    {
      provide: PRODUCT_REPOSITORY,
      useClass: ProductRepository,
    },
  ],
  exports: [ProductService, PRODUCT_REPOSITORY],
})
export class ProductModule {}
