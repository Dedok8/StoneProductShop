import { AuthModule } from '@modules/auth';
import { ProductModule } from '@modules/product';
import { UserModule } from '@modules/user/user.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@shared/prisma';
import { RedisModule } from '@shared/redis';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RedisModule,
    AuthModule,
    UserModule,
    ProductModule,
  ],
})
export class AppModule {}
