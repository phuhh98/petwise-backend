import { ApiProperty } from '@nestjs/swagger';
import { DiaryNS } from 'src/common/entities/diary.entity';
import { PetProfileNS } from 'src/common/entities/pet.entity';

export class GeolocationResDto {
  @ApiProperty()
  ISO_A3: string;
  @ApiProperty()
  lat: number;
  @ApiProperty()
  lng: number;
  @ApiProperty()
  place_name: string;
}

export class TravelAssisstantResDto {
  @ApiProperty()
  answer: string;

  @ApiProperty()
  location: GeolocationResDto | any;
}

export class PetDiaryBuilderResDto extends DiaryNS.DiaryGeneratedAnalysis {}

export class PetProfileBuilderResDto extends PetProfileNS.PetProfile {}
