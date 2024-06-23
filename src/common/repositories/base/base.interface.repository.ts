import {
  FieldPath,
  OrderByDirection,
  WhereFilterOp,
} from 'firebase-admin/firestore';
import { FindManyReturnFormatDto } from 'src/common/dtos/find-many-return.interface';

export abstract class IBaseRepository<T> {
  abstract create(dto: T): Promise<T>;

  abstract findAll(
    conditions: QueryCondition[],
    options?: QueryOptions,
  ): Promise<FindManyReturnFormatDto<T>>;

  // findOneByCondition(condition?: object, projection?: string): Promise<T>;

  abstract findOneById(id: string, projection?: string): Promise<T>;

  protected abstract permanentlyDelete(id: string): Promise<boolean>;

  // softDelete(id: string): Promise<boolean>;

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
