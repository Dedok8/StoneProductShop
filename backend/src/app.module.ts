import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';

import { validateEnv } from '@/config/env.validation';
import {
  AuthModule,
  CartModule,
  CategoryModule,
  CheckoutModule,
  InspirationModule,
  LeadsModule,
  OrderModule,
  ProductModule,
  ProductOriginModule,
  ProductTypeModule,
  UserModule,
} from '@/model';
import { ProductColorModule } from '@/model/productColor';
import {
  AppThrottlerGuard,
  HealthController,
  PrismaModule,
  RedisModule,
  UploadModule,
} from '@/shared';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV ?? 'development'}`, '.env'],
      validate: validateEnv,
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
    UploadModule,
    ProductTypeModule,
    ProductOriginModule,
    ProductColorModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: AppThrottlerGuard },
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
  ],
})
export class AppModule {}
