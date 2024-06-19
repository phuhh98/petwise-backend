import { Module } from '@nestjs/common';
import { GooleAIFileServiceWrapper } from 'src/llm/langchain/googleServices/googleFileUpload.service';
import { LLMService } from 'src/llm/llm.service';

import { LLMController } from './llm.controller';

@Module({
  controllers: [LLMController],
  providers: [LLMService, GooleAIFileServiceWrapper],
})
export class LLMModule {}
