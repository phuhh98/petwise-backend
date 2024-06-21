import { Module } from '@nestjs/common';
import { GooleAIFileServiceWrapper } from './langchain/googleServices/googleFileUpload.service';
import { LLMService } from './llm.service';

import { LLMController } from './llm.controller';

@Module({
  controllers: [LLMController],
  providers: [LLMService, GooleAIFileServiceWrapper],
})
export class LLMModule {}
