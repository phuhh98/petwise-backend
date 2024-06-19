import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CreatePetDto, UpdatePetDto } from './pet.dto';
import { PetService } from './pet.service';
import { FirebaseAuthenticationGuard } from 'src/common/guards/firebase-authentication.guard';
import { ResLocals } from 'src/types/express.types';
// import { ControllerReturn } from 'src/types/nest-controller-return-format.types';
// import { Pet, PetId } from 'src/types/pet.type';
import { ProviderTokens } from 'src/common/constants/provider-token.constant';
import { TypeGuards } from 'src/common/services/type-guards.service';
import { PetOwnershipGuard } from './pet-ownership.guard';

@Controller('pet')
@UseGuards(FirebaseAuthenticationGuard)
export class PetController {
  @Inject(ProviderTokens['TYPE_GUARDS'])
  private readonly typeGuards: TypeGuards;

  constructor(private readonly petService: PetService) {}

  @Get('list')
  async listPet(
    @Res({ passthrough: true })
    response: ResLocals.FirebaseAuthenticatedRequest,
  ) /*: Promise<ControllerReturn.CrudCompletedMessage<(Pet & PetId)[]>>*/ {
    const user_id = response.locals.user_id;

    const pets = await this.petService.listPet(user_id);

    return {
      message: 'List pets succeed',
      pets,
    };
  }

  @Post()
  async createPet(
    @Body()
    createPetDto: CreatePetDto,
    @Res({ passthrough: true })
    response: ResLocals.FirebaseAuthenticatedRequest,
  ) /*: Promise<ControllerReturn.CrudCompletedMessage<Pet & PetId>> */ {
    const user_id = response.locals.user_id;
    createPetDto.user_id = user_id;

    const pet = await this.petService.create(createPetDto);

    return {
      message: 'Create pet succeed',
      pet,
    };
  }

  @UseGuards(PetOwnershipGuard)
  @Get(':pet_id')
  async getPet(
    @Param('pet_id') pet_id: string,
  ) /*: Promise<ControllerReturn.CrudCompletedMessage<Pet & PetId>> */ {
    const pet = await this.petService.findOne(pet_id);

    return {
      message: 'Get pet succeed',
      pet,
    };
  }

  @UseGuards(PetOwnershipGuard)
  @Patch(':pet_id')
  async updatePet(
    @Param('pet_id') pet_id: string,
    @Body()
    updatePetDto: UpdatePetDto,
  ) {
    const updatedData = await this.petService.update(pet_id, updatePetDto);

    return {
      message: 'Update pet succeed',
      pet: updatedData,
    };
  }

  @UseGuards(PetOwnershipGuard)
  @Delete(':pet_id')
  async deletePet(@Param('pet_id') pet_id: string) {
    await this.petService.remove(pet_id);

    return {
      message: `Delete pet_id ${pet_id} succeed`,
    };
  }
}
