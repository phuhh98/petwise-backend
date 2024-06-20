import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IGeolocationRes, ITravelAssisstantReponse } from './llm.type';
import { IPetDiary, IPetEmotion } from 'src/types/pet.type';

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
  location: GeolocationResDto;

  @ApiProperty()
  answer: string;
}

class PetEmotionDto implements IPetEmotion {
  @ApiProperty()
  description: string;

  @ApiProperty()
  primary_emotion: string;

  @ApiProperty()
  secondary_emotions: string[];
}
export class PetDiaryDto implements IPetDiary {
  @ApiProperty()
  actions: string[];

  @ApiProperty()
  advice: string;

  @ApiProperty()
  emotions: PetEmotionDto;
}
