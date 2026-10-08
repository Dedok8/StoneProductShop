import { Module } from '@nestjs/common';

import { UploadController } from '@/shared/upload/upload.controller';
import { UploadService } from '@/shared/upload/upload.service';

@Module({
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
