import { Bucket } from '@google-cloud/storage';
import {
  CollectionReference,
  FieldValue,
  Firestore,
} from 'firebase-admin/firestore';
import { FindManyReturnFormatDto } from 'src/common/dtos/find-many-return.interface';
import { UploadedFileDto } from 'src/common/dtos/uploaded-file.dto';
import { BaseEntity, IBaseEntity } from 'src/common/entities/base.entity';
import { FirestorageService } from 'src/common/services/firebase/firebase-storage.service';
import { isTimeStamp } from 'src/common/utils/typeGuards';

import {
  FindAllCondition,
  IBaseRepository,
  QueryOptions,
} from './base.interface.repository';

export abstract class BaseRepositoryAbstract<T extends IBaseEntity>
  implements IBaseRepository<T>
{
  private readonly FILE_TYPE_META: string;
  private readonly bucket: Bucket;
  private readonly collection: CollectionReference<T>;
  protected constructor(
    private readonly fireStore: Firestore,
    private readonly fireStorageService: FirestorageService,
    collectionName: string,
    file_type_meta: string,
  ) {
    this.collection = this.fireStore.collection(
      collectionName,
    ) as CollectionReference<T>;
    this.FILE_TYPE_META = file_type_meta;
    this.bucket = this.fireStorageService.getStoragebucket();
  }

  private async isDocDataExist(
    docRef: FirebaseFirestore.DocumentReference<T>,
  ): Promise<T> {
    const docData = (await docRef.get()).data();
    if (!docData) {
      throw new Error('Resource does not exist');
    }
    return await this.parseIdAndTimeStamp(docRef, docData);
  }

  private async parseId(
    docRef: FirebaseFirestore.DocumentReference<T>,
    docData?: T,
  ): Promise<T> {
    if (!docData) {
      docData = (await docRef.get()).data();
    }

    return {
      ...docData,
      id: docRef.id,
    };
  }

  private async parseIdAndTimeStamp(
    docRef: FirebaseFirestore.DocumentReference<T>,
    docData?: T,
  ) {
    return this.parseTimeStamp(await this.parseId(docRef, docData));
  }

  private parseTimeStamp(docData: T): T {
    return {
      ...docData,
      created_at: isTimeStamp(docData.created_at)
        ? docData.created_at.toDate()
        : docData.created_at,

      updated_at: isTimeStamp(docData.updated_at)
        ? docData.updated_at.toDate()
        : docData.updated_at,
    };
  }

  async create(dto: T): Promise<T> {
    const docRef = await this.collection.add({
      ...dto,
      /**
       * Generate Timestamp instances
       * Firebase use Timestamp class under the hood
       */
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
    });

    const createdDoc = await this.isDocDataExist(docRef);
    return this.parseTimeStamp({
      ...createdDoc,
      id: docRef.id,
    });
  }

  async deleteFile(uniqueBucketFileName: string) {
    const file = this.bucket.file(uniqueBucketFileName);

    await file.delete();
    return true;
  }

  async findAll(
    condition: FindAllCondition,
    options?: QueryOptions,
  ): Promise<FindManyReturnFormatDto<T>> {
    let query: ReturnType<CollectionReference<T>['where']>;
    for (let i = 0; i < condition.length; i++) {
      if (!query) {
        query = this.collection.where(
          condition[i].fieldPath,
          condition[i].opStr,
          condition[i].value,
        );
        continue;
      }
      query.where(
        condition[i].fieldPath,
        condition[i].opStr,
        condition[i].value,
      );
    }

    if (options?.orderBy) {
      query.orderBy(options.orderBy.fieldPath, options.orderBy.directionStr);
    }

    if (options?.limit) {
      query.limit(options.limit);
    }

    if (options?.offSet) {
      query.offset(options.offSet);
    }

    const querySnapshot = await query.get();

    if (!querySnapshot.size) {
      return {
        count: 0,
        items: [],
      };
    }

    const docs = querySnapshot.docs.map((doc) =>
      this.parseTimeStamp({
        ...doc.data(),
        id: doc.id,
      }),
    );

    return {
      count: querySnapshot.size,
      items: docs,
    };
  }

  async findOneById(id: string): Promise<T> {
    const docRef = this.collection.doc(id);
    const data = await this.isDocDataExist(docRef);
    return this.parseTimeStamp({ ...data, id: docRef.id });
  }

  async permanentlyDelete(id: string): Promise<boolean> {
    const docRef = this.collection.doc(id);
    await docRef.delete();
    return true;
  }

  async update(id: string, dto: Partial<T>): Promise<T> {
    const docRef = this.collection.doc(id);

    await docRef.update({
      ...dto,
      /**
       * Update update_at Timestamp
       */
      updated_at: FieldValue.serverTimestamp(),
    } as Partial<T> & Pick<BaseEntity, 'updated_at'>);

    const updatedData = await this.isDocDataExist(docRef);

    return this.parseTimeStamp({
      ...updatedData,
      id: docRef.id,
    });
  }

  /**
   * Upload and return public Url of a file
   * @param fileAbsolutePath
   * @param fileMeta
   * @returns
   */
  async uploadFile({
    contentType,
    customMetadata,
    file_name,
    fileAbsolutePath,
  }: IFIleUploadParams): Promise<UploadedFileDto> {
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

export interface IFIleUploadParams {
  contentType: string;
  customMetadata?: Record<string, any>;
  file_name: string;
  fileAbsolutePath: string;
}
