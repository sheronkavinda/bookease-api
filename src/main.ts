import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // All API endpoints begin with /api
  app.setGlobalPrefix('api');

  // Global request validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global error response formatting
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('BookEase API')
    .setDescription(
      'REST API for managing services and customer bookings',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const swaggerDocument = SwaggerModule.createDocument(
    app,
    swaggerConfig,
  );

  SwaggerModule.setup('api/docs', app, swaggerDocument);

  const port = process.env.PORT ?? 3000;

  await app.listen(port);

  console.log(
    `BookEase API is running on http://localhost:${port}/api`,
  );

  console.log(
    `Swagger documentation: http://localhost:${port}/api/docs`,
  );
}

bootstrap();