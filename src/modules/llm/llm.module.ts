import { Module } from '@nestjs/common';

import { GooleAIFileServiceWrapper } from './langchain/googleServices/googleFileUpload.service';
import { LLMController } from './llm.controller';
import { LLMService } from './llm.service';

@Module({
  controllers: [LLMController],
  providers: [LLMService, GooleAIFileServiceWrapper],
})
export class LLMModule {}