import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { PetDiaryNS } from 'src/interfaces/entities/pet-diary.interface';

import { IGeolocationRes, ITravelAssisstantReponse } from './llm.type';

export class TravelAssitantQueryDto {
  @IsString()
  question: string;
}

class GeolocationResDto implements IGeolocationRes {
  @ApiProperty()
  ISO_A3: string;
  @ApiProperty()
  lat: number;
  @ApiProperty()
  lng: number;
  @ApiProperty()
  place_name: string;
}

export class TravelAssisstantResDto implements ITravelAssisstantReponse {
  @ApiProperty()
  answer: string;

  @ApiProperty()
  location: GeolocationResDto;
}

class PetEmotionDto implements PetDiaryNS.IPetEmotion {
  @ApiProperty()
  description: string;

  @ApiProperty()
  primary_emotion: string;

  @ApiProperty()
  secondary_emotions: string[];
}
export class PetDiaryDto implements PetDiaryNS.IPetDiaryGenaratedAnalysis {
  @ApiProperty()
  actions: string[];

  @ApiProperty()
  advice: string;

  @ApiProperty()
  emotions: PetEmotionDto;
}
