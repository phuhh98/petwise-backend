import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { configSwagger } from './common/configs/api-doc.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['verbose'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
    }),
  );
  app.enableCors({ origin: process.env.CORS_ALLOWED_ORIGIN.split('||') });
  configSwagger(app);
  await app.listen(process.env.PORT);
}
bootstrap();
