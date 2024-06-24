import { Injectable } from '@nestjs/common';
import { BaseServiceAbstract } from 'src/common/services/base/base.abstract.service';

import { PetCareEmbeddingEntity } from '../entities/petcare-embedding.entity';
import { PetCareEmbeddingRepository } from '../repositories/petcare-embeding.repository';

@Injectable()
export class PetCareEmbeddingService extends BaseServiceAbstract<PetCareEmbeddingEntity> {
  constructor(
    private readonly petCareEmbeddingRepository: PetCareEmbeddingRepository,
  ) {
    super(petCareEmbeddingRepository);
  }
}
