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
  quantity: number;

  @IsNumber()
  price: number;

  @IsNumber()
  price_total: number;
}
export class ReceiptExtractorRes {
  @IsString()
  receipt_date: Date | string;

  @IsString()
  currency: string;

  @IsNumber()
  total_receipt_price: number;

  @IsString()
  error: string;

  @ValidateNested({ each: true })
  @Type(() => ReceiptItem)
  items: ReceiptItem;
}
