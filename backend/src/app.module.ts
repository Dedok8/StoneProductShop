import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';

import { envValidationSchema } from '@/config/env.validation';
import {
  AuthModule,
  CategoryModule,
  OrderModule,
  ProductModule,
  UserModule,
} from '@/model';
import { CartModule } from '@/model/cart';
import { CheckoutModule } from '@/model/checkout';
import {
  AppThrottlerGuard,
  HealthController,
  PrismaModule,
  RedisModule,
} from '@/shared';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false,
      },
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60_000,
        limit: 100,
      },
    ]),
    PrismaModule,
    RedisModule,
    AuthModule,
    UserModule,
    CategoryModule,
    ProductModule,
    OrderModule,
    CartModule,
    CheckoutModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AppThrottlerGuard,
    },
  ],
})
export class AppModule {}
