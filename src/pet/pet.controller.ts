import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreatePetDto, Pet, UpdatePetDto } from './pet.dto';
import { PetService } from './pet.service';
import { FirebaseAuthenticationGuard } from 'src/common/guards/firebase-authentication.guard';
import { ResLocals } from 'src/types/express.types';
import { PetOwnershipGuard } from './pet-ownership.guard';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import {
  ApiAppSuccessResponse,
  ApiAppSuccessResponseArrayData,
} from 'src/common/decorators/generic-response.decorator';
import { EmptyDto, FileUploadDto } from 'src/common/dto/common-request.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { v4 as uuidv4 } from 'uuid';
import path from 'node:path';
import fs from 'node:fs/promises';

@ApiTags('pet')
@ApiBearerAuth()
@Controller('pet')
@UseGuards(FirebaseAuthenticationGuard)
export class PetController {
  constructor(private readonly petService: PetService) {}

  @Get('list')
  @HttpCode(HttpStatus.OK)
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
  @HttpCode(HttpStatus.CREATED)
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
  @HttpCode(HttpStatus.OK)
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
  @HttpCode(HttpStatus.OK)
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
  @HttpCode(HttpStatus.OK)
  @Delete(':pet_id')
  @ApiAppSuccessResponse(EmptyDto)
  async deletePet(@Param('pet_id') pet_id: string) {
    await this.petService.remove(pet_id);

    return {
      message: `Delete pet_id ${pet_id} succeed`,
    };
  }

  @UseGuards(PetOwnershipGuard)
  @Post(':pet_id/avatar')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'A image of a pet',
    type: FileUploadDto,
  })
  @ApiAppSuccessResponse(Pet, 'pet')
  async petProfileBuilder(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            /**
             * 20MB in bytes
             */
            maxSize: 20 * 1024 * 1024,
          }),
          /**
           * Goolge API supported formats for images
           * https://ai.google.dev/gemini-api/docs/prompting_with_media?lang=node#image_formats
           */
          new FileTypeValidator({
            fileType: /image\/(png|jpeg|webp|heic|heif)/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Res({ passthrough: true })
    response: ResLocals.FirebaseAuthenticatedRequest,
    @Param('pet_id') pet_id: string,
  ) {
    /**
     * File temporary store is out side of try block
     */
    const TEMP_FILE_NAME = `${uuidv4()}`;
    const TEMP_FILE_PATH = path.resolve(__dirname, TEMP_FILE_NAME);
    await fs.writeFile(TEMP_FILE_PATH, file.buffer);

    try {
      const user_id = response.locals.user_id;

      const fileData = await this.petService.uploadAvatarImage({
        file_name: TEMP_FILE_NAME,
        contentType: file.mimetype,
        fileAbsolutePath: TEMP_FILE_PATH,
        customMetadata: {
          user_id,
          pet_id: pet_id,
        },
      });

      const pet = await this.petService.findOne(pet_id);

      // if file exist then delete before update
      if (!!pet.avatar?.file_id && !!pet.avatar?.file_name) {
        await this.petService.deleteAvatarImage(pet.avatar.file_name);
      }

      // then update record with new info
      await this.petService.update(pet_id, { avatar: fileData });

      return {
        data: { pet: await this.petService.findOne(pet_id) },
        message: 'Update pet avatar succeed',
      };
    } catch (err) {
      throw err;
    } finally {
      await fs.rm(TEMP_FILE_PATH);
    }
  }
}
