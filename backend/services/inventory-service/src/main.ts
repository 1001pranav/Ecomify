import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { EventPublisher } from './events/event-publisher.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // Set API prefix
  const apiPrefix = process.env.API_PREFIX || '/api/v1';
  app.setGlobalPrefix(apiPrefix);

  // Connect to RabbitMQ
  const eventPublisher = app.get(EventPublisher);
  await eventPublisher.connect();

  const port = process.env.PORT || 3006;
  await app.listen(port);

  console.log(`🚀 Inventory Service is running on port ${port}`);
  console.log(`📚 API available at: http://localhost:${port}${apiPrefix}`);
  console.log(`📦 Multi-location inventory management enabled`);
  console.log(`⚠️  Low stock alerts enabled (hourly checks)`);
}

bootstrap();
