import { Injectable } from '@nestjs/common';
import { DiaryEntity } from 'src/common/entities/diary.entity';
import { BaseRepositoryAbstract } from 'src/common/repositories/base/base.abstract.repository';
import {
  IBaseRepository,
  QueryCondition,
  QueryOptions,
} from 'src/common/repositories/base/base.interface.repository';
import { FirestorageService } from 'src/common/services/firebase/firebase-storage.service';
import { FirestoreService } from 'src/common/services/firebase/firestore.service';

const COLLECTION_NAME = 'diary';
const ASSOCIATED_FILE_TYPE_META = 'diary_image';

@Injectable()
export class DiaryRepository extends BaseRepositoryAbstract<DiaryEntity> {
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
  async listDiary(
    searchParams: IListDiaryParams,
  ): Promise<ReturnType<IBaseRepository<DiaryEntity>['findAll']>> {
    const values = searchParams.values;
    const searchCondition: QueryCondition[] = [
      { fieldPath: 'user_id', opStr: '==', value: values.user_id },
    ];
    if (!!values.pet_id) {
      searchCondition.push({
        fieldPath: 'pet_id',
        opStr: '==',
        value: values.pet_id,
      });
    }

    return await super.findAll(searchCondition, searchParams.options);
  }
}

export interface IListDiaryParams {
  options?: QueryOptions;
  values: {
    pet_id?: string;
    user_id: string;
  };
}
