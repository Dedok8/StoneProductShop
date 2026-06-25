import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from '@shared/filters';
import { LoggingInterceptor } from '@shared/interceptors/logging.interceptor';
import { TransformInterceptor } from '@shared/interceptors/transform.interceptor';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. CORS — must be before other middleware
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : false,
    credentials: true, // required for httpOnly cookie (refresh token)
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // 2. Middleware (before everything else)
  app.use(cookieParser());

  // 3. Global filters — catch exceptions (registered in reverse order of priority)
  // AllExceptionsFilter appears first in the code but is triggered last — it catches everything else
  app.useGlobalFilters(new AllExceptionsFilter());

  // 4. Global interceptors — wrap the request/response
  app.useGlobalInterceptors(
    new LoggingInterceptor(), // Log each request
    new TransformInterceptor(), // Wrap the response in { data, timestamp }
  );

  // 5. Global pipes — validation of incoming data
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // automatically converts types (string → number using @Type)
      whitelist: true, // Removes fields that are not present in the DTO
      forbidNonWhitelisted: true, // Throws an error if extra fields are present
    }),
  );

  // 6. Swagger
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('StoneProductShop API')
      .setDescription('Backend API for natural stone e-commerce')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
