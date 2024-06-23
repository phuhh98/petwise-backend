import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { OrderDirection } from 'src/common/constants/query.constant';
import {
  PaginateQuery,
  SortQueryDto,
} from 'src/common/dtos/common-request.dto';
import { PetEntity, PetSortableField } from 'src/common/entities/pet.entity';

export class CreatePetDto extends IntersectionType(
  PickType(PetEntity, ['name']),
  PartialType(PickType(PetEntity, ['user_id', 'bio', 'profile'])),
) {}

class AllowedToUpdate extends PickType(PetEntity, ['name', 'bio', 'profile']) {}
export class UpdatePetDto extends IntersectionType(
  PartialType(AllowedToUpdate),
) {}

export class PetSortQueryDto implements SortQueryDto<PetSortableField> {
  @IsOptional()
  @IsEnum(OrderDirection)
  order: OrderDirection;

  @IsOptional()
  @IsEnum(PetSortableField)
  orderBy: PetSortableField;
}

export class ListPetQueryDto extends IntersectionType(
  PetSortQueryDto,
  PartialType(PaginateQuery),
) {}
