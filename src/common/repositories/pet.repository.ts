import { Injectable } from '@nestjs/common';
import { PetEntity } from 'src/common/entities/pet.entity';
import { BaseRepositoryAbstract } from 'src/common/repositories/base/base.abstract.repository';
import {
  IBaseRepository,
  QueryOptions,
} from 'src/common/repositories/base/base.interface.repository';
import { FirestorageService } from 'src/common/services/firebase/firebase-storage.service';
import { FirestoreService } from 'src/common/services/firebase/firestore.service';

const COLLECTION_NAME = 'pet';
const ASSOCIATED_FILE_TYPE_META = 'pet_avatar_image';
@Injectable()
export class PetRepository extends BaseRepositoryAbstract<PetEntity> {
  constructor(
    fireStoreService: FirestoreService,
    fireStorageService: FirestorageService,
  ) {
    super(
      fireStoreService.fireStore,
      fireStorageService,
      COLLECTION_NAME,
      ASSOCIATED_FILE_TYPE_META,
    );
  }

  async listPetByUserId(
    user_id: string,
    options: QueryOptions,
  ): Promise<ReturnType<IBaseRepository<PetEntity>['findAll']>> {
    return await super.findAll(
      [{ fieldPath: 'user_id', opStr: '==', value: user_id }],
      options,
    );
  }
}
