import { CategoryService } from '@modules/category/application';
import { CATEGORY_REPOSITORY } from '@modules/category/domain';
import { CategoryRepository } from '@modules/category/infrastructure';
import { CategoryController } from '@modules/category/presentation';
import { Module } from '@nestjs/common';
import { PrismaModule } from '@shared/prisma';

@Module({
  imports: [PrismaModule],
  controllers: [CategoryController],
  providers: [
    CategoryService,
    {
      provide: CATEGORY_REPOSITORY,
      useClass: CategoryRepository,
    },
  ],
  exports: [CategoryService],
})
export class CategoryModule {}
