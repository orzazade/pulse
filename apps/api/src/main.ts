import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Refuse to start with default JWT secret in production
  if (
    process.env.NODE_ENV !== 'development' &&
    (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'change-me-in-production')
  ) {
    logger.error('JWT_SECRET must be set to a secure value in non-development environments');
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new GlobalExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const corsOrigin = process.env.CORS_ORIGIN;
  app.enableCors({
    origin: corsOrigin ? corsOrigin.split(',') : true,
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`Pulse API running on port ${port}`);
}
bootstrap();
