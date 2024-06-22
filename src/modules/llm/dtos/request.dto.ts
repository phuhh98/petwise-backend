import { IsString } from 'class-validator';

export class TravelAssitantQueryDto {
  @IsString()
  question: string;
}
