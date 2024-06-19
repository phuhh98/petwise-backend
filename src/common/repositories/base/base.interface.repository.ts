import {
  FieldPath,
  OrderByDirection,
  WhereFilterOp,
} from 'firebase-admin/firestore';
import { BaseEntity, FindAllResponse } from 'src/types/common.type';

export interface BaseRepositoryInterface<T extends BaseEntity> {
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
  ): Promise<FindAllResponse<T>>;

  update(id: string, dto: Partial<T>): Promise<T>;

  // softDelete(id: string): Promise<boolean>;

  permanentlyDelete(id: string): Promise<boolean>;
}
