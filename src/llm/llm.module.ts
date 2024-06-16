import { Module } from '@nestjs/common';

import { LLMController } from './llm.controller';
import { LLMService } from 'src/common/langchain/llm.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [LLMController],
  imports: [ConfigModule],
  providers: [LLMService],
})
export class LLMModule {}
