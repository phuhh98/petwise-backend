import { IsNumber } from 'class-validator';
export abstract class FindManyReturnFormatDto<T> {
  @IsNumber()
  count: number;

  items: T[];

  @IsNumber()
  max_items: number;

  @IsNumber()
  page: number;
}
