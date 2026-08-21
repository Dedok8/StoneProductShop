import { Module } from '@nestjs/common';

import { InspirationImageService } from '@/model/inspiration/application';
import { INSPIRATION_IMAGE_REPOSITORY } from '@/model/inspiration/domain';
import { InspirationImageRepository } from '@/model/inspiration/infrastructure';
import { InspirationController } from '@/model/inspiration/presentation';

@Module({
  controllers: [InspirationController],
  providers: [
    InspirationImageService,
    {
      provide: INSPIRATION_IMAGE_REPOSITORY,
      useClass: InspirationImageRepository,
    },
  ],
  exports: [InspirationImageService, INSPIRATION_IMAGE_REPOSITORY],
})
export class InspirationModule {}
