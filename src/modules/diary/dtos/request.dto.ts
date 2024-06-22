import {
  IntersectionType,
  OmitType,
  PartialType,
  PickType,
} from '@nestjs/swagger';
import { DiaryEntity } from 'src/common/entities/diary.entity';

export class CreateDiaryDto extends IntersectionType(
  OmitType(DiaryEntity, ['id', 'user_id', 'image', 'created_at', 'updated_at']),
  PartialType(PickType(DiaryEntity, ['user_id'])),
) {}

export class UpdateDiaryDto extends PartialType(
  OmitType(DiaryEntity, [
    'id',
    'pet_id',
    'user_id',
    'created_at',
    'updated_at',
  ]),
) {}

export class ListDiaryDto extends PartialType(
  PickType(DiaryEntity, ['pet_id']),
) {}
