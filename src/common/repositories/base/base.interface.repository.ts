import {
  FieldPath,
  OrderByDirection,
  WhereFilterOp,
} from 'firebase-admin/firestore';
import { IBaseEntity } from 'src/interfaces/entities/common.interface';
import { IFindManyReturnFormat } from 'src/interfaces/services/find-many-return.interface';

export interface IBaseRepository<T extends IBaseEntity> {
  create(dto: T): Promise<T>;

  findOneById(id: string, projection?: string): Promise<T>;

  // findOneByCondition(condition?: object, projection?: string): Promise<T>;

  findAll(
    condition: {
      fieldPath: string | FieldPath;
      opStr: WhereFilterOp;
      value: any;
    }[],
    options?: {
      orderBy?: {
        fieldPath: string | FieldPath;
        directionStr?: OrderByDirection;
      };
      limit?: number;
      offSet?: number;
    },
  ): Promise<IFindManyReturnFormat<T>>;

  update(id: string, dto: Partial<T>): Promise<T>;

  // softDelete(id: string): Promise<boolean>;

  permanentlyDelete(id: string): Promise<boolean>;
}
