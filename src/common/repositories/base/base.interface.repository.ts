import {
  FieldPath,
  OrderByDirection,
  WhereFilterOp,
} from 'firebase-admin/firestore';
import { FindManyReturnFormatDto } from 'src/common/dtos/find-many-return.interface';

export interface IBaseRepository<T> {
  create(dto: T): Promise<T>;

  findAll(
    condition: FindAllCondition,
    options?: QueryOptions,
  ): Promise<FindManyReturnFormatDto<T>>;

  // findOneByCondition(condition?: object, projection?: string): Promise<T>;

  findOneById(id: string, projection?: string): Promise<T>;

  permanentlyDelete(id: string): Promise<boolean>;

  // softDelete(id: string): Promise<boolean>;

  update(id: string, dto: Partial<T>): Promise<T>;
}

export type QueryCondition = {
  fieldPath: FieldPath | string;
  opStr: WhereFilterOp;
  value: any;
};

export type FindAllCondition = QueryCondition[];
export type QueryOptions = {
  limit?: number;
  offSet?: number;
  orderBy?: {
    directionStr?: OrderByDirection;
    fieldPath: FieldPath | string;
  };
};
