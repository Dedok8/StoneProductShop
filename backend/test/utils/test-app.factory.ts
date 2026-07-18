import {
  ValidationPipe,
  VersioningType,
  type INestApplication,
} from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import type { App } from 'supertest/types';

import { AppModule } from '@/app.module';
import {
  AllExceptionsFilter,
  HttpExceptionFilter,
  LoggingInterceptor,
  PrismaExceptionFilter,
  TransformInterceptor,
} from '@/shared';

export async function createTestApp(): Promise<INestApplication<App>> {
  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();

  app.use(cookieParser());

  app.useGlobalFilters(
    new PrismaExceptionFilter(),
    new HttpExceptionFilter(),
    new AllExceptionsFilter(),
  );

  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'api/v',
  });

  await app.init();
  return app;
}
