import {
  FieldPath,
  OrderByDirection,
  WhereFilterOp,
} from 'firebase-admin/firestore';
import { FindManyReturnFormatDto } from 'src/common/dtos/find-many-return.interface';

export abstract class IBaseRepository<T> {
  abstract create(dto: T): Promise<T>;

  abstract createMany(
    dtos: Omit<T, 'created_at' | 'id' | 'updated_at'>[],
  ): Promise<boolean>;

  // findOneByCondition(condition?: object, projection?: string): Promise<T>;

  abstract delete(id: string, ..._: unknown[]): Promise<boolean>;

  abstract findAll(
    conditions: QueryCondition[],
    options?: QueryOptions,
  ): Promise<FindManyReturnFormatDto<T>>;

  // softDelete(id: string): Promise<boolean>;

  abstract findOneById(id: string, projection?: string): Promise<T>;
  protected abstract permanentlyDelete(id: string): Promise<boolean>;

  abstract update(id: string, dto: Partial<T>): Promise<T>;
}

export type QueryCondition = {
  fieldPath: FieldPath | string;
  opStr: WhereFilterOp;
  value: any;
};

export type QueryOptions = {
  limit?: number;
  offSet?: number;
  orderBy?: {
    directionStr?: OrderByDirection;
    fieldPath: FieldPath | string;
  };
};
