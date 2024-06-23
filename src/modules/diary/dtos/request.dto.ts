import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { OrderDirection } from 'src/common/constants/query.constant';
import {
  PaginateQuery,
  SortQueryDto,
} from 'src/common/dtos/common-request.dto';
import {
  DiaryEntity,
  DiarySortableField,
} from 'src/common/entities/diary.entity';

export class CreateDiaryDto extends IntersectionType(
  PickType(DiaryEntity, ['pet_id', 'analysis']),
  PartialType(PickType(DiaryEntity, ['user_id', 'diary_date'])),
) {}

export class UpdateDiaryDto extends IntersectionType(
  PickType(DiaryEntity, ['analysis']),
  PartialType(PickType(DiaryEntity, ['diary_date'])),
) {}

export class DiarySortQueryDto implements SortQueryDto<DiarySortableField> {
  @IsOptional()
  @IsEnum(OrderDirection)
  order: OrderDirection;

  @IsOptional()
  @IsEnum(DiarySortableField)
  orderBy: DiarySortableField;
}

export class ListDiaryQueryDto extends IntersectionType(
  DiarySortQueryDto,
  PartialType(PaginateQuery),
  PickType(DiaryEntity, ['pet_id']),
) {}
