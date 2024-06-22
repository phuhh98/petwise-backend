import { CollectionReference, Firestore } from 'firebase-admin/firestore';
import { FindManyReturnFormatDto } from 'src/common/dtos/find-many-return.interface';

import {
  FindAllCondition,
  IBaseRepository,
  QueryOptions,
} from './base.interface.repository';

export abstract class BaseRepositoryAbstract<T> implements IBaseRepository<T> {
  private readonly collection: CollectionReference<T>;
  protected constructor(
    private readonly fireStore: Firestore,
    private readonly collectionName: string,
  ) {
    this.collection = this.fireStore.collection(
      collectionName,
    ) as CollectionReference<T>;
  }

  private async isDocDataExist<T>(
    docRef: FirebaseFirestore.DocumentReference<T>,
  ): Promise<T> {
    const data = (await docRef.get()).data();
    if (!data) throw new Error('Resource does not exist');
    return data;
  }

  async create(dto: T | any): Promise<T> {
    const docRef = await this.collection.add(dto);
    const createdDoc = await this.isDocDataExist(docRef);
    return {
      ...createdDoc,
      id: docRef.id,
    };
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

    const docs = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    return {
      count: querySnapshot.size,
      items: docs,
    };
  }

  async findOneById(id: string): Promise<T> {
    const docRef = this.collection.doc(id);
    const data = await this.isDocDataExist(docRef);
    return { ...data, id: docRef.id } as T;
  }

  async permanentlyDelete(id: string): Promise<boolean> {
    const docRef = this.collection.doc(id);
    await docRef.delete();
    return true;
  }

  async update(id: string, dto: Partial<T>): Promise<T> {
    const docRef = this.collection.doc(id);

    await docRef.update({ ...dto });

    const updatedData = await this.isDocDataExist(docRef);

    return {
      ...updatedData,
      id: docRef.id,
    };
  }
}
