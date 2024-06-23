import { PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { FindManyReturnFormatDto } from 'src/common/dtos/find-many-return.interface';
import { RouteHandlerReturn } from 'src/common/dtos/route-handler-return.dto';
import { PetEntity } from 'src/common/entities/pet.entity';

export class CreatPetResDto extends RouteHandlerReturn {
  @ValidateNested()
  @Type(() => PetEntity)
  pet: PetEntity;
}

export class UpdatePetResDto extends CreatPetResDto {}

export class GetPetResDto extends CreatPetResDto {}

export class DeletePetResDto extends RouteHandlerReturn {}

class ListPetItems extends FindManyReturnFormatDto<PetEntity> {
  @ValidateNested({ each: true })
  @Type(() => PetEntity)
  items: PetEntity[];
}

export class ListPetResDto extends RouteHandlerReturn {
  @ValidateNested()
  @Type(() => ListPetItems)
  pets: ListPetItems;
}
PickType;

export class UploadImageResDto extends RouteHandlerReturn {
  @ValidateNested()
  @Type(() => CreatPetResDto)
  data: CreatPetResDto;
}
