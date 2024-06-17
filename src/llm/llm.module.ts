import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GooleAIFileServiceWrapper } from 'src/common/googleServices/googleFileUpload.service';
import { LLMService } from 'src/common/langchain/llm.service';

import { LLMController } from './llm.controller';

@Module({
  controllers: [LLMController],
  imports: [ConfigModule],
  providers: [LLMService, GooleAIFileServiceWrapper],
})
export class LLMModule {}
