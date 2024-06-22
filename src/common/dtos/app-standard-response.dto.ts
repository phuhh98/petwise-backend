import { IsNumber, IsOptional, IsString } from 'class-validator';

import { DataErrorDto } from './data-error.dto';

export class AppStandardReponseDto<T> extends DataErrorDto {
  @IsOptional()
  data: T;

  @IsString()
  message: string;

  @IsNumber()
  status: number;
}
