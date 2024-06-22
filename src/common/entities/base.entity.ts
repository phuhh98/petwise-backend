import { IsString } from 'class-validator';

export class BaseEntity {
  @IsString()
  created_at: string;

  @IsString()
  id: string;

  @IsString()
  updated_at: string;
}
