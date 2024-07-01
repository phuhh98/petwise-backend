import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsString, ValidateNested } from 'class-validator';
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

class ReceiptItem {
  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsNumber()
  price_total: number;

  @IsNumber()
  quantity: number;
}
export class ReceiptExtractorRes {
  @IsString()
  currency: string;

  @IsString()
  error: string;

  @ValidateNested({ each: true })
  @Type(() => ReceiptItem)
  items: ReceiptItem;

  @IsString()
  receipt_date: Date | string;

  @IsNumber()
  total_receipt_price: number;
}
