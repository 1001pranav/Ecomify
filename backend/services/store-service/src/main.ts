/**
 * Store Service - Main Entry Point
 * Implements Store Management Service (Sprint 2)
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation with class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // Enable CORS for API Gateway
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  const port = process.env.STORE_SERVICE_PORT || 3002;
  await app.listen(port);

  console.log(`🏪 Store Service running on http://localhost:${port}`);
}

bootstrap();
