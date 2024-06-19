import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { configSwagger } from './common/configs/api-doc.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['debug'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  app.enableCors({ origin: process.env.CORS_ALLOWED_ORIGIN.split('||') });
  configSwagger(app);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
