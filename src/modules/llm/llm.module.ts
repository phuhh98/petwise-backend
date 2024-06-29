import { Module } from '@nestjs/common';
import { PetCareEmbeddingRepository } from 'src/common/repositories/petcare-embeding.repository';
import { PetCareUploadedDocsRepository } from 'src/common/repositories/petcare-uploaded-docs.repository';

import { GooleFileUploadService } from './googleServices/googleFileUpload.service';
import { GooleGenAIService } from './googleServices/googleGenAI.service';
import { LLMController } from './llm.controller';
import { LLMService } from './llm.service';
import { MongoDBStoreService } from './vectorstores/mongodb.store.service';
import { PetcareDocsStore } from './vectorstores/petcareDocs.store';

@Module({
  controllers: [LLMController],
  providers: [
    LLMService,
    GooleFileUploadService,
    PetCareEmbeddingRepository,
    PetCareUploadedDocsRepository,
    GooleGenAIService,
    MongoDBStoreService,
    PetcareDocsStore,
  ],
})
export class LLMModule {}
