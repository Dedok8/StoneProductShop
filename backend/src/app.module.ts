import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';

import { envValidationSchema } from '@/config/env.validation';
import {
  AuthModule,
  CartModule,
  CategoryModule,
  CheckoutModule,
  InspirationModule,
  LeadsModule,
  OrderModule,
  ProductModule,
  UserModule,
} from '@/model';
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
    LeadsModule,
    InspirationModule,
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
