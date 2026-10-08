import { Module } from '@nestjs/common';

import { CategoryService } from '@/model/category/application';
import { CATEGORY_REPOSITORY } from '@/model/category/domain/interfaces';
import { CategoryRepository } from '@/model/category/infrastructure/category.repository';
import { CategoryController } from '@/model/category/presentation';

@Module({
  controllers: [CategoryController],
  providers: [
    CategoryService,
    {
      provide: CATEGORY_REPOSITORY,
      useClass: CategoryRepository,
    },
  ],
  exports: [CategoryService, CATEGORY_REPOSITORY],
})
export class CategoryModule {}
