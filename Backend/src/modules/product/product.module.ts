import {
  ProductCacheService,
  ProductService,
} from '@modules/product/application';
import { PRODUCT_REPOSITORY } from '@modules/product/domain';
import { ProductRepository } from '@modules/product/infrastructure';
import { ProductController } from '@modules/product/presentation';
import { Module } from '@nestjs/common';
import { PrismaModule } from '@shared/prisma';

@Module({
  imports: [PrismaModule],
  controllers: [ProductController],
  providers: [
    ProductService,
    ProductCacheService,
    {
      provide: PRODUCT_REPOSITORY,
      useClass: ProductRepository,
    },
  ],
  exports: [ProductService],
})
export class ProductModule {}
