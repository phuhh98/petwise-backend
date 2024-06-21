import {
  FieldPath,
  OrderByDirection,
  WhereFilterOp,
} from 'firebase-admin/firestore';
import { IBaseEntity } from 'src/interfaces/entities/common.interface';
import { IFindManyReturnFormat } from 'src/interfaces/services/find-many-return.interface';

export interface IBaseRepository<T extends IBaseEntity> {
  create(dto: T): Promise<T>;

  findAll(
    condition: FindAllCondition,
    options?: QueryOptions,
  ): Promise<IFindManyReturnFormat<T>>;

  // findOneByCondition(condition?: object, projection?: string): Promise<T>;

  findOneById(id: string, projection?: string): Promise<T>;

  permanentlyDelete(id: string): Promise<boolean>;

  // softDelete(id: string): Promise<boolean>;

  update(id: string, dto: Partial<T>): Promise<T>;
}

type QueryCondition = {
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
