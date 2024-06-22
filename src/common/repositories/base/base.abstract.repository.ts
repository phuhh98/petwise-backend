import { Bucket } from '@google-cloud/storage';
import { CollectionReference, Firestore } from 'firebase-admin/firestore';
import { FindManyReturnFormatDto } from 'src/common/dtos/find-many-return.interface';
import { UploadedFileDto } from 'src/common/dtos/uploaded-file.dto';
import { BaseEntity } from 'src/common/entities/base.entity';
import { FirestorageService } from 'src/common/services/firebase/firebase-storage.service';

import {
  FindAllCondition,
  IBaseRepository,
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
    return {
      ...docSnapshot.data(),
      id: docSnapshot.id,
      created_at: docSnapshot.createTime.toDate(),
      updated_at: docSnapshot.updateTime.toDate(),
    };
  }

  async create(dto: T): Promise<T> {
    const docRef = await this.collection.add(dto);

    return this.parseIdAndTimeStamp(await docRef.get());
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

    const docs = await Promise.all(
      querySnapshot.docs.map(
        async (docSnapshot) => await this.parseIdAndTimeStamp(docSnapshot),
      ),
    );

    return {
      count: querySnapshot.size,
      items: docs,
    };
  }

  async findOneById(id: string): Promise<T> {
    const docRef = this.collection.doc(id);
    const docData = await this.isDocDataExist(docRef);
    return docData;
  }

  public async delete(id: string, ...args: unknown[]): Promise<boolean> {
    return await this.permanentlyDelete(id);
  }

  protected async permanentlyDelete(id: string): Promise<boolean> {
    const docRef = this.collection.doc(id);
    await docRef.delete();
    return true;
  }

  async update(id: string, dto: Partial<T>): Promise<T> {
    const docRef = this.collection.doc(id);

    await docRef.update(dto);

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
