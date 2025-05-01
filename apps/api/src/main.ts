import { NestFactory } from '@nestjs/core';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function bootstrap() {
  // lazy-load module to allow usage of environment variables
  const { AppModule } = await import('./app.module.js');
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
