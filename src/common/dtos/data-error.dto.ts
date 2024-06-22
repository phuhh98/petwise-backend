import { IsObject, IsString } from 'class-validator';

export class DataErrorDto {
  @IsString()
  @IsObject()
  error: Error | null | object | string;
}
