import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LLMModule } from './llm/llm.module';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.local.env'],
      isGlobal: true,
    }),
    LLMModule,
  ],
  providers: [AppService],
})
export class AppModule {}
