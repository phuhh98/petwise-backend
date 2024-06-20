import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CreatePetDto, Pet, UpdatePetDto } from './pet.dto';
import { PetService } from './pet.service';
import { FirebaseAuthenticationGuard } from 'src/common/guards/firebase-authentication.guard';
import { ResLocals } from 'src/types/express.types';
import { PetOwnershipGuard } from './pet-ownership.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  ApiAppSuccessResponse,
  ApiAppSuccessResponseArrayData,
} from 'src/common/decorators/generic-response.decorator';
import { EmptyDto } from 'src/common/dto/common-request.dto';

@ApiTags('pet')
@ApiBearerAuth()
@Controller('pet')
@UseGuards(FirebaseAuthenticationGuard)
export class PetController {
  constructor(private readonly petService: PetService) {}

  @Get('list')
  @ApiAppSuccessResponseArrayData(Pet)
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
  @ApiAppSuccessResponse(Pet, 'pet')
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
  @ApiAppSuccessResponse(Pet, 'pet')
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
  @ApiAppSuccessResponse(Pet, 'pet')
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
  @ApiAppSuccessResponse(EmptyDto)
  async deletePet(@Param('pet_id') pet_id: string) {
    await this.petService.remove(pet_id);

    return {
      message: `Delete pet_id ${pet_id} succeed`,
    };
  }
}
