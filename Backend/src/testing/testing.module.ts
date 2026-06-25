import { Module } from '@nestjs/common';
import { PrismaModule } from '@shared/prisma';

import { TestingController } from './testing.controller';

@Module({
  imports: [PrismaModule],
  controllers: [TestingController],
})
export class TestingModule {}
