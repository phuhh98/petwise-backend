import {
  IntersectionType,
  OmitType,
  PartialType,
  PickType,
} from '@nestjs/swagger';

import { Pet } from './pet.dto';

export class CreatePetDto extends IntersectionType(
  OmitType(Pet, ['id', 'user_id', 'avatar']),
  PartialType(PickType(Pet, ['user_id', 'bio', 'profile'])),
) {}

export class UpdatePetDto extends PartialType(
  OmitType(Pet, ['id', 'user_id', 'avatar']),
) {}
