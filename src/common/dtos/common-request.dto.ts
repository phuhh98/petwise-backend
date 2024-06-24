import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { OrderByDirection } from 'firebase-admin/firestore';

import { OrderDirection } from '../constants/query.constant';

export class FileUploadDtoSwagger {
  @ApiProperty({ format: 'binary', type: 'string' })
  file: any;
}

export class EmptyDto {}

export abstract class SortQueryDto<AllowedFields> {
  order: OrderDirection;

  orderBy: AllowedFields;
}
export class PaginateQuery {
  @IsNumber({ allowNaN: false })
  max_items: number;

  @IsNumber({ allowNaN: false })
  page: number;
}

export interface IListSortAndPaging<SortableField> {
  max_items: number;
  page: number;
  sort: {
    order: OrderByDirection;
    sortKey: SortableField;
  };
}
