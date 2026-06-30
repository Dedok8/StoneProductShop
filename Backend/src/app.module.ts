import { AuthModule } from '@modules/auth';
import { CategoryModule } from '@modules/category/category.module';
import { OrderModule } from '@modules/order/order.module';
import { ProductModule } from '@modules/product';
import { UserModule } from '@modules/user/user.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { HealthController } from '@shared/health';
import { PrismaModule } from '@shared/prisma';
import { RedisModule } from '@shared/redis';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        // default global limit: 100 requests / 60s per IP
        name: 'default',
        ttl: 60_000,
        limit: 100,
      },
    ]),
    PrismaModule,
    RedisModule,
    AuthModule,
    UserModule,
    ProductModule,
    CategoryModule,
    OrderModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
