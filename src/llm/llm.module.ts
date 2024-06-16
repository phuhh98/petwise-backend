import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LLMService } from 'src/common/langchain/llm.service';

import { LLMController } from './llm.controller';

@Module({
  controllers: [LLMController],
  imports: [ConfigModule],
  providers: [LLMService],
})
export class LLMModule {}
