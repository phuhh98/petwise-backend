import { IsString } from 'class-validator';

export class TravelAssitantDto {
  @IsString()
  question: string;
}
