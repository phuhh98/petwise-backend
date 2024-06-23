import { IsNumber } from 'class-validator';

export abstract class FindManyReturnFormatDto<T> {
  @IsNumber()
  count: number;

  abstract items: T[];
}
