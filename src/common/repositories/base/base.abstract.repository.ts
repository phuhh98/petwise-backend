import { Bucket } from '@google-cloud/storage';
import { isObject } from 'class-validator';
import {
  CollectionReference,
  Firestore,
  Timestamp,
} from 'firebase-admin/firestore';
import _ from 'lodash';
import { MAX_BATCH_SIZE } from 'src/common/constants/firebase.constant';
import { FindManyReturnFormatDto } from 'src/common/dtos/find-many-return.interface';
import { UploadedFileDto } from 'src/common/dtos/uploaded-file.dto';
import { BaseEntity } from 'src/common/entities/base.entity';
import { FirestorageService } from 'src/common/services/firebase/firebase-storage.service';
import { limitAndOffSetToMaxItemsAndPage } from 'src/common/utils/converter';
import { isTimeStamp } from 'src/common/utils/typeGuards';

import {
  IBaseRepository,
  QueryCondition,
  QueryOptions,
} from './base.interface.repository';

export abstract class BaseRepositoryAbstract<
  T extends BaseEntity,
> extends IBaseRepository<T> {
  private readonly FILE_TYPE_META: string;
  private readonly bucket: Bucket;
  private readonly collection: CollectionReference<T>;
  protected constructor(
    private readonly fireStore: Firestore,
    private readonly fireStorageService: FirestorageService,
    collectionName: string,
    file_type_meta: string,
  ) {
    super();
    this.collection = this.fireStore.collection(
      collectionName,
    ) as CollectionReference<T>;
    this.FILE_TYPE_META = file_type_meta;
    this.bucket = this.fireStorageService.getStoragebucket();
  }

  private async isDocDataExist(
    docRef: FirebaseFirestore.DocumentReference<T>,
  ): Promise<T> {
    const docSnapshot = await docRef.get();
    if (!docSnapshot.data()) {
      throw new Error('Resource does not exist');
    }
    return await this.parseIdAndTimeStamp(docSnapshot);
  }

  private async parseIdAndTimeStamp(
    docSnapshot: FirebaseFirestore.DocumentSnapshot<
      T,
      FirebaseFirestore.DocumentData
    >,
  ): Promise<T> {
    let docData = docSnapshot.data();

    /**
     * Convert key value of Timestamp to ISO 8601 standard format
     * Recursively
     * @param data
     * @returns
     */
    function recurMapTimestampToDate<T extends Record<string, Timestamp | any>>(
      data: T,
    ) {
      for (const key in data) {
        if (isObject(data[key]) && !isTimeStamp(data[key])) {
          data[key] = recurMapTimestampToDate(data[key]);
          continue;
        }

        if (isTimeStamp(data[key])) {
          data[key] = data[key].toDate();
        } else {
          continue;
        }
      }
      return data;
    }

    function includeIdAndTimestamp<T extends BaseEntity>(data: T) {
      return {
        ...data,
        created_at: docSnapshot.createTime,
        id: docSnapshot.id,
        updated_at: docSnapshot.updateTime,
      };
    }

    docData = recurMapTimestampToDate(includeIdAndTimestamp(docData));

    return docData;
  }

  async create(dto: T): Promise<T> {
    const docRef = await this.collection.add(JSON.parse(JSON.stringify(dto)));

    return this.parseIdAndTimeStamp(await docRef.get());
  }

  /**
   * This will only return boolean, batch write is too many operation
   * and cost another read operation is quite waste of bandwidth
   * @param dtos
   */

  async createMany(
    dtos: Omit<T, 'created_at' | 'id' | 'updated_at'>[],
  ): Promise<boolean> {
    /**
     * Firestore max batch size is 500 operations per batch
     * https://firebase.google.com/docs/firestore/manage-data/transactions#batched-writes
     */
    const chunks = _.chunk(dtos, MAX_BATCH_SIZE);

    await Promise.all(
      chunks.map(async (batchOfItems) => {
        const batch = this.fireStore.batch();
        batchOfItems.forEach(async (item) => {
          const docRef = this.collection.doc();
          batch.set(docRef, JSON.parse(JSON.stringify(item)));
        });
        await batch.commit();
      }),
    );

    return true;
  }

  public async delete(id: string, ..._: unknown[]): Promise<boolean> {
    return await this.permanentlyDelete(id);
  }

  async deleteFile(uniqueBucketFileName: string) {
    const file = this.bucket.file(uniqueBucketFileName);

    await file.delete();
    return true;
  }

  async findAll(
    conditions: QueryCondition[],
    options: QueryOptions = {},
  ): Promise<FindManyReturnFormatDto<T>> {
    let queryRef: ReturnType<CollectionReference<T>['where']>;
    for (let i = 0; i < conditions.length; i++) {
      if (!queryRef) {
        queryRef = this.collection.where(
          conditions[i].fieldPath,
          conditions[i].opStr,
          conditions[i].value,
        );
      } else {
        queryRef = queryRef.where(
          conditions[i].fieldPath,
          conditions[i].opStr,
          conditions[i].value,
        );
      }
    }

    if (options?.orderBy) {
      queryRef = queryRef.orderBy(
        options.orderBy.fieldPath,
        options.orderBy.directionStr,
      );
    }

    if (options?.limit) {
      queryRef = queryRef.limit(options.limit);
    }

    if (options?.offSet) {
      queryRef = queryRef.offset(options.offSet);
    }

    const querySnapshot = await queryRef.get();

    if (!querySnapshot.size) {
      return {
        ...limitAndOffSetToMaxItemsAndPage(options.limit, options.offSet),
        count: 0,
        items: [],
      };
    }

    const docs = await Promise.all(
      querySnapshot.docs.map(
        async (docSnapshot) => await this.parseIdAndTimeStamp(docSnapshot),
      ),
    );

    return {
      ...limitAndOffSetToMaxItemsAndPage(options.limit, options.offSet),
      count: querySnapshot.size,
      items: docs,
    };
  }

  async findOneById(id: string): Promise<T> {
    const docRef = this.collection.doc(id);
    const docData = await this.isDocDataExist(docRef);
    return docData;
  }

  protected async permanentlyDelete(id: string): Promise<boolean> {
    const docRef = this.collection.doc(id);
    await docRef.delete();
    return true;
  }

  async update(id: string, dto: Partial<T>): Promise<T> {
    const docRef = this.collection.doc(id);

    await docRef.update(JSON.parse(JSON.stringify(dto)));

    return await this.parseIdAndTimeStamp(await docRef.get());
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
