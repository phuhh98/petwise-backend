import {
  IsDataURI,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { Pet, PetProfileNS } from 'src/types/pet.type';
import { Type } from 'class-transformer';

namespace PetProfileDtoNS {
  class PetCoatingDto implements PetProfileNS.PetCoating {
    @IsString()
    colors: string;

    @IsString()
    type: string;
  }

  class PetHeadDto implements PetProfileNS.PetHead {
    @IsString()
    ears: string;

    @IsString()
    eyes: string;

    @IsString()
    legs: string;

    @IsString()
    nose: string;

    @IsString()
    shape: string;
  }

  class PetBodyDto implements PetProfileNS.PetBody {
    @IsString()
    build: string;

    @IsString()
    tail: string;
  }

  class PetHealthDto implements PetProfileNS.PetHealth {
    @IsString()
    commonHealthIssues: string;

    @IsString()
    lifespan: string;
  }

  class PetGroomingDto implements PetProfileNS.PetGrooming {
    @IsString()
    bathing: string;

    @IsString()
    frequency: string;
  }
  class PetExerciseDto implements PetProfileNS.PetExercise {
    @IsString()
    needs: string;

    @IsString()
    suitableFor: string;
  }

  class PetTemperamentDto implements PetProfileNS.PetTemperament {
    @IsString()
    barkingTendency: string;

    @IsString()
    energyLevel: string;

    @IsString()
    personality: string;

    @IsString()
    trainability: string;
  }

  class PetAppearanceDto implements PetProfileNS.PetAppearance {
    @IsString()
    size: string;

    @ValidateNested()
    @Type(() => PetCoatingDto)
    coat: PetCoatingDto;

    @ValidateNested()
    @Type(() => PetHeadDto)
    head: PetHeadDto;

    @ValidateNested()
    @Type(() => PetBodyDto)
    body: PetBodyDto;

    @IsString()
    legs: string;
  }

  export class PetProfileDto implements PetProfileNS.PetProfile {
    @IsString()
    type: string;

    @IsString()
    breed: string;

    @IsString()
    description: string;

    @ValidateNested()
    @Type(() => PetAppearanceDto)
    appearance: PetAppearanceDto;

    @ValidateNested()
    @Type(() => PetTemperamentDto)
    temperament: PetTemperamentDto;

    @ValidateNested()
    @Type(() => PetHealthDto)
    health: PetHealthDto;

    @ValidateNested()
    @Type(() => PetGroomingDto)
    grooming: PetGroomingDto;

    @ValidateNested()
    @Type(() => PetExerciseDto)
    exercise: PetExerciseDto;
  }
}

export class CreatePetDto implements Pet {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  bio: string;

  @IsOptional()
  @IsUrl()
  avatar: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PetProfileDtoNS.PetProfileDto)
  profile: PetProfileDtoNS.PetProfileDto;

  user_id: string;
}

export class UpdatePetDto implements Omit<Pet, 'user_id'> {
  @IsString()
  @IsOptional()
  name: string;

  @IsOptional()
  @IsString()
  bio: string;

  @IsOptional()
  @IsDataURI()
  avatar: string;

  // @IsOptional()
  // @IsObject()
  @ValidateNested()
  @Type(() => PetProfileDtoNS.PetProfileDto)
  profile: PetProfileDtoNS.PetProfileDto;
}
