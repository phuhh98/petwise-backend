import { Bucket } from '@google-cloud/storage';
import { Injectable } from '@nestjs/common';
import { UploadedFileDto } from 'src/common/dto/uploaded-file.dto';
import { BaseRepositoryAbstract } from 'src/common/repositories/base/base.abstract.repository';
import { IBaseRepository } from 'src/common/repositories/base/base.interface.repository';
import { FirestorageService } from 'src/common/services/firebase/firebase-storage.service';
import { FirestoreService } from 'src/common/services/firebase/firestore.service';
import { IDiary } from 'src/interfaces/entities/pet-diary.interface';

import {
  IDiaryRepository,
  IImageUploadParams,
  IListDiaryParams,
} from './interfaces/diary.interface.repository';

const COLLECTION_NAME = 'diary';

@Injectable()
export class DiaryRepository
  extends BaseRepositoryAbstract<IDiary>
  implements IDiaryRepository
{
  private readonly FILE_TYPE_META = 'diary_image';
  private readonly bucket: Bucket;
  constructor(
    private readonly fireStoreService: FirestoreService,
    private readonly fireStorageService: FirestorageService,
  ) {
    super(fireStoreService.fireStore, COLLECTION_NAME);

    this.bucket = this.fireStorageService.getStoragebucket();
  }

  async deleteFile(uniqueBucketFileName: string) {
    const file = this.bucket.file(uniqueBucketFileName);

    await file.delete();
    return true;
  }

  async listDiary(
    searchParams: IListDiaryParams,
  ): Promise<ReturnType<IBaseRepository<IDiary>['findAll']>> {
    const values = searchParams.values;
    return await super.findAll(
      [
        { fieldPath: 'user_id', opStr: '==', value: values.user_id },
        !!values.pet_id && {
          fieldPath: 'pet_id',
          opStr: '==',
          value: values.pet_id,
        },
      ],
      searchParams.options,
    );
  }

  /**
   * Upload and return public Url of a file
   * @param fileAbsolutePath
   * @param fileMeta
   * @returns
   */
  async uploadDiaryImage({
    contentType,
    customMetadata,
    file_name,
    fileAbsolutePath,
  }: IImageUploadParams): Promise<UploadedFileDto> {
    const [file] = await this.bucket.upload(fileAbsolutePath, {
      contentType,
    });

    await file.setMetadata({
      metadata: {
        ...customMetadata,
        type: this.FILE_TYPE_META,
      },
    });

    return {
      file_id: file.id,
      file_name,
      public_url: file.makePublic() && file.publicUrl(),
    };
  }
}
