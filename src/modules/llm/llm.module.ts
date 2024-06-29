import { Module } from '@nestjs/common';
import { PetCareEmbeddingRepository } from 'src/common/repositories/petcare-embeding.repository';
import { PetCareUploadedDocsRepository } from 'src/common/repositories/petcare-uploaded-docs.repository';
import { PetCareEmbeddingService } from 'src/common/services/petcare-embedding.service';
import { PetCareUploadedDocsService } from 'src/common/services/petcare-uploaded-docs.service';

import { GooleFileUploadService } from './googleServices/googleFileUpload.service';
import { GooleGenAIService } from './googleServices/googleGenAI.service';
import { LLMController } from './llm.controller';
import { LLMService } from './llm.service';

@Module({
  controllers: [LLMController],
  providers: [
    LLMService,
    GooleFileUploadService,
    PetCareEmbeddingService,
    PetCareUploadedDocsService,
    PetCareEmbeddingRepository,
    PetCareUploadedDocsRepository,
    GooleGenAIService,
  ],
})
export class LLMModule {}
