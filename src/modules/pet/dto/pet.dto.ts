import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';
import {
  IPet,
  IUploadedFile,
  PetProfileNS,
} from 'src/interfaces/entities/pet.interface';

export namespace PetProfileDtoNS {
  class PetCoatingDto implements PetProfileNS.IPetCoating {
    @IsString()
    colors: string;

    @IsString()
    type: string;
  }

  class PetHeadDto implements PetProfileNS.IPetHead {
    @IsString()
    ears: string;

    @IsString()
    eyes: string;

    @IsString()
    nose: string;

    @IsString()
    shape: string;
  }

  class PetBodyDto implements PetProfileNS.IPetBody {
    @IsString()
    build: string;

    @IsString()
    tail: string;
  }

  class PetHealthDto implements PetProfileNS.IPetHealth {
    @IsString()
    commonHealthIssues: string;

    @IsString()
    lifespan: string;
  }

  class PetGroomingDto implements PetProfileNS.IPetGrooming {
    @IsString()
    bathing: string;

    @IsString()
    frequency: string;
  }
  class PetExerciseDto implements PetProfileNS.IPetExercise {
    @IsString()
    needs: string;

    @IsString()
    suitableFor: string;
  }

  class PetTemperamentDto implements PetProfileNS.IPetTemperament {
    @IsString()
    barkingTendency: string;

    @IsString()
    energyLevel: string;

    @IsString()
    personality: string;

    @IsString()
    trainability: string;
  }

  class PetAppearanceDto implements PetProfileNS.IPetAppearance {
    @ValidateNested()
    @Type(() => PetBodyDto)
    body: PetBodyDto;

    @ValidateNested()
    @Type(() => PetCoatingDto)
    coat: PetCoatingDto;

    @ValidateNested()
    @Type(() => PetHeadDto)
    head: PetHeadDto;

    @IsString()
    legs: string;

    @IsString()
    size: string;
  }

  export class PetProfileDto implements PetProfileNS.IPetProfile {
    @ValidateNested()
    @Type(() => PartialType(PetAppearanceDto))
    appearance: PetAppearanceDto;

    @IsString()
    breed: string;

    @IsString()
    description: string;

    @ValidateNested()
    @Type(() => PartialType(PetExerciseDto))
    exercise: PetExerciseDto;

    @ValidateNested()
    @Type(() => PartialType(PetGroomingDto))
    grooming: PetGroomingDto;

    @ValidateNested()
    @Type(() => PartialType(PetHealthDto))
    health: PetHealthDto;

    @ValidateNested()
    @Type(() => PartialType(PetTemperamentDto))
    temperament: PetTemperamentDto;

    @IsString()
    type: string;
  }
}

export class UploadedFileDto implements IUploadedFile {
  @IsString()
  file_id: string;

  @IsString()
  file_name: string;

  @IsUrl()
  public_url: string;
}

export class Pet implements IPet {
  @ValidateNested()
  @Type(() => PartialType(UploadedFileDto))
  avatar: UploadedFileDto;

  @IsOptional()
  @IsString()
  bio?: string;

  id: string;

  @IsString()
  name: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PartialType(PetProfileDtoNS.PetProfileDto))
  profile?: PetProfileDtoNS.PetProfileDto;

  user_id: string;
}
