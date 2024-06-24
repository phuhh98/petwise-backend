import { Injectable } from '@nestjs/common';
import { BaseServiceAbstract } from 'src/common/services/base/base.abstract.service';

import { PetCareUploadedDocsEntity } from '../entities/petcare-uploaded-docs.entity';
import { PetCareUploadedDocsRepository } from '../repositories/petcare-uploaded-docs.repository';

@Injectable()
export class PetCareUploadedDocsService extends BaseServiceAbstract<PetCareUploadedDocsEntity> {
  constructor(
    private readonly petCareUploadedDocsRepository: PetCareUploadedDocsRepository,
  ) {
    super(petCareUploadedDocsRepository);
  }
}
