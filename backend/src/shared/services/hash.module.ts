import { Module } from '@nestjs/common';

import { HashService } from '@/shared/services/hash.service';

@Module({
  providers: [HashService],
  exports: [HashService],
})
export class HashModule {}
