import { Bucket } from '@google-cloud/storage';
import { Injectable } from '@nestjs/common';
import { UploadedFileDto } from 'src/common/dtos/uploaded-file.dto';
import { PetEntity } from 'src/common/entities/pet.entity';
import { BaseRepositoryAbstract } from 'src/common/repositories/base/base.abstract.repository';
import { IBaseRepository } from 'src/common/repositories/base/base.interface.repository';
import { FirestorageService } from 'src/common/services/firebase/firebase-storage.service';
import { FirestoreService } from 'src/common/services/firebase/firestore.service';

const COLLECTION_NAME = 'pet';

export interface IAvatarUploadOptions {
  contentType: string;
  customMetadata?: Record<string, any>;
  file_name: string;
  fileAbsolutePath: string;
}
@Injectable()
export class PetRepository extends BaseRepositoryAbstract<PetEntity> {
  private readonly FILE_TYPE_META = 'pet_avatar_image';
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

  async listPetByUserId(
    user_id: string,
  ): Promise<ReturnType<IBaseRepository<PetEntity>['findAll']>> {
    return await super.findAll([
      { fieldPath: 'user_id', opStr: '==', value: user_id },
    ]);
  }

  /**
   * Upload and return public Url of a file
   * @param fileAbsolutePath
   * @param fileMeta
   * @returns
   */
  async uploadPetAvatar({
    contentType,
    customMetadata,
    file_name,
    fileAbsolutePath,
  }: IAvatarUploadOptions): Promise<UploadedFileDto> {
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
