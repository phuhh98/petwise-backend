import { OmitType, PartialType } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';
import { IsObject, IsString, ValidateNested } from 'class-validator';

import { BaseEntity } from './base.entity';
import { UploadedFileEntity } from './uploaded-file.entity';

export namespace PetProfileNS {
  class PetCoating {
    @IsString()
    colors: string;

    @IsString()
    type: string;
  }

  class PetHead {
    @IsString()
    ears: string;

    @IsString()
    eyes: string;

    @IsString()
    nose: string;

    @IsString()
    shape: string;
  }

  class PetBody {
    @IsString()
    build: string;

    @IsString()
    tail: string;
  }

  class PetHealth {
    @IsString()
    commonHealthIssues: string;

    @IsString()
    lifespan: string;
  }

  class PetGrooming {
    @IsString()
    bathing: string;

    @IsString()
    frequency: string;
  }
  class PetExercise {
    @IsString()
    needs: string;

    @IsString()
    suitableFor: string;
  }

  class PetTemperament {
    @IsString()
    barkingTendency: string;

    @IsString()
    energyLevel: string;

    @IsString()
    personality: string;

    @IsString()
    trainability: string;
  }

  class PetAppearance {
    @IsObject()
    @ValidateNested()
    @Type(() => PetBody)
    body: PetBody;

    @IsObject()
    @ValidateNested()
    @Type(() => PetCoating)
    coat: PetCoating;

    @IsObject()
    @ValidateNested()
    @Type(() => PetHead)
    head: PetHead;

    @IsString()
    legs: string;

    @IsString()
    size: string;
  }

  export class PetProfile {
    @IsObject()
    @ValidateNested()
    @Type(() => PartialType(PetAppearance))
    appearance: PetAppearance;

    @IsString()
    breed: string;

    @IsString()
    description: string;

    @IsObject()
    @ValidateNested()
    @Type(() => PartialType(PetExercise))
    exercise: PetExercise;

    @IsObject()
    @ValidateNested()
    @Type(() => PartialType(PetGrooming))
    grooming: PetGrooming;

    @IsObject()
    @ValidateNested()
    @Type(() => PartialType(PetHealth))
    health: PetHealth;

    @IsObject()
    @ValidateNested()
    @Type(() => PartialType(PetTemperament))
    temperament: PetTemperament;

    @IsString()
    type: string;
  }
}

export class PetEntity extends BaseEntity {
  @IsObject()
  @ValidateNested()
  @Type(() => PartialType(UploadedFileEntity))
  avatar: UploadedFileEntity;

  @IsString()
  bio: string;

  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsObject()
  @ValidateNested()
  @Type(() => PartialType(PetProfileNS.PetProfile))
  profile: PetProfileNS.PetProfile;

  @Exclude()
  @IsString()
  user_id: string;
}

export class PetEntitySwagger extends OmitType(PetEntity, ['user_id']) {}
