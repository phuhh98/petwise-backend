import { Injectable } from '@nestjs/common';
import { BaseRepositoryAbstract } from 'src/common/repositories/base/base.abstract.repository';
import { FirestorageService } from 'src/common/services/firebase/firebase-storage.service';
import { FirestoreService } from 'src/common/services/firebase/firestore.service';

import { PetCareUploadedDocsEntity } from '../entities/petcare-uploaded-docs.entity';

const COLLECTION_NAME = 'petcare-uploaded-docs';
const ASSOCIATED_FILE_TYPE_META = 'none';

@Injectable()
export class PetCareUploadedDocsRepository extends BaseRepositoryAbstract<PetCareUploadedDocsEntity> {
  constructor(
    private readonly fireStoreService: FirestoreService,
    fireStorageService: FirestorageService,
  ) {
    super(
      fireStoreService.fireStore,
      fireStorageService,
      COLLECTION_NAME,
      ASSOCIATED_FILE_TYPE_META,
    );
  }
}
