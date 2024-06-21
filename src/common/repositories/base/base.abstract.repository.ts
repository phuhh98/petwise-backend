import {
  CollectionReference,
  FieldPath,
  Firestore,
  OrderByDirection,
  WhereFilterOp,
} from 'firebase-admin/firestore';
import { IBaseEntity } from 'src/interfaces/entities/common.interface';
import { IFindManyReturnFormat } from 'src/interfaces/services/find-many-return.interface';

import { IBaseRepository } from './base.interface.repository';

export abstract class BaseRepositoryAbstract<T extends IBaseEntity>
  implements IBaseRepository<T>
{
  private readonly collection: CollectionReference<Omit<T, 'id'>>;
  protected constructor(
    private readonly fireStore: Firestore,
    private readonly collectionName: string,
  ) {
    this.collection = this.fireStore.collection(
      collectionName,
    ) as CollectionReference<Omit<T, 'id'>>;
  }

  /**
   * Throw Error on Internal operation error
   * @param dto
   * @returns Promise<T>
   */
  async create(dto: T | any): Promise<T> {
    const docRef = await this.collection.add(dto);
    const createdDoc = (await docRef.get()).data();
    if (createdDoc) {
      return {
        ...createdDoc,
        id: docRef.id,
      } as T;
    }

    throw new Error(`Error during create ${this.collectionName}`);
  }

  async findAll(
    condition: {
      fieldPath: FieldPath | string;
      opStr: WhereFilterOp;
      value: unknown;
    }[],
    options?: {
      limit?: number;
      offSet?: number;
      orderBy?: {
        directionStr?: OrderByDirection;
        fieldPath: FieldPath | string;
      };
    },
  ): Promise<IFindManyReturnFormat<T>> {
    let query: ReturnType<CollectionReference<Omit<T, 'id'>>['where']>;
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
      ...(doc.data() as T),
      pet_id: doc.id,
    }));

    return {
      count: querySnapshot.size,
      items: docs,
    };
  }

  /**
   * Throw Error on Not Found entity
   * @param id
   * @returns Promise<T>
   */
  async findOneById(id: string): Promise<T> {
    const docRef = this.collection.doc(id);
    const petData = (await docRef.get()).data();
    if (!!petData) {
      return { ...petData, id: docRef.id } as T;
    }
    throw new Error(`Can not find ${this.collectionName} with id ${id}`);
  }

  async permanentlyDelete(id: string): Promise<boolean> {
    const docRef = this.collection.doc(id);
    await docRef.delete();
    return true;
  }

  /**
   * Throw Error on internal operation Error
   * @param id
   * @param dto
   * @returns Promise<T>
   */
  async update(id: string, dto: Partial<T>): Promise<T> {
    const docRef = this.collection.doc(id);

    await docRef.update({ ...dto });

    const updatedData = (await docRef.get()).data();
    if (updatedData) {
      return {
        ...updatedData,
        id: docRef.id,
      } as T;
    }

    throw new Error(`Error during update ${this.collectionName} id ${id}`);
  }
}
