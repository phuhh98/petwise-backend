import {
  IntersectionType,
  OmitType,
  PartialType,
  PickType,
} from '@nestjs/swagger';
import { PetEntity } from 'src/common/entities/pet.entity';

export class CreatePetDto extends IntersectionType(
  OmitType(PetEntity, ['id', 'user_id', 'avatar', 'created_at', 'updated_at']),
  PartialType(PickType(PetEntity, ['user_id', 'bio', 'profile'])),
) {}

export class UpdatePetDto extends PartialType(
  OmitType(PetEntity, ['id', 'user_id', 'avatar', 'created_at', 'updated_at']),
) {}
