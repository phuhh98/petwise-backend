import { IsNumber, IsObject } from 'class-validator';

export class FindManyReturnFormatDto<T> {
  @IsNumber()
  count: number;

  @IsObject({ each: true })
  items: T[];
}
