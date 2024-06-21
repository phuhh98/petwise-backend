import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { I18nService } from 'nestjs-i18n';
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  ApiAppCreateSuccessResponse,
  ApiAppSuccessResponse,
  ApiAppSuccessResponseArrayData,
} from 'src/common/decorators/swagger/generic-response.decorator';
import { EmptyDto, FileUploadDto } from 'src/common/dto/common-request.dto';
import { FirebaseAuthenticationGuard } from 'src/common/guards/firebase-authentication.guard';
import { I18nTranslations } from 'src/generated/i18n.generated';
import { ResLocals } from 'src/interfaces/express.interface';
import { v4 as uuidv4 } from 'uuid';

import { Pet } from './dto/pet.dto';
import { CreatePetDto, UpdatePetDto } from './dto/request.dto';
import { PetService } from './pet.service';
import { PetOwnershipGuard } from './pet-ownership.guard';

const CONTROLLER_ROUTE_PATH = 'pet';
const ENTITY_PATH = 'pet';
const ENTITY_NAME = 'Pet';

enum REQUEST_PARAM {
  ENTITY_ID = 'pet_id',
  FILE_FIELD_NAME = 'file',
}

enum ROUTES {
  CREATE = ENTITY_PATH,
  DELETE = `${ENTITY_PATH}/:${REQUEST_PARAM.ENTITY_ID}`,
  GET = `${ENTITY_PATH}/:${REQUEST_PARAM.ENTITY_ID}`,
  LIST = 'list',
  UPDATE = `${ENTITY_PATH}/:${REQUEST_PARAM.ENTITY_ID}`,
  UPLOAD_AVATAR = `${ENTITY_PATH}/:${REQUEST_PARAM.ENTITY_ID}/avatar`,
}

@ApiTags(CONTROLLER_ROUTE_PATH)
@ApiBearerAuth()
@Controller(CONTROLLER_ROUTE_PATH)
@UseGuards(FirebaseAuthenticationGuard)
export class PetController {
  constructor(
    private readonly petService: PetService,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  @Post(ROUTES.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiAppCreateSuccessResponse(Pet, 'pet')
  async createPet(
    @Body()
    createPetDto: CreatePetDto,
    @Res({ passthrough: true })
    response: ResLocals.FirebaseAuthenticatedRequest,
  ) {
    const user_id = response.locals.user_id;
    createPetDto.user_id = user_id;

    const pet = await this.petService.create(createPetDto).catch((_) => {
      throw new InternalServerErrorException(
        this.i18n.t('entity.createError', { args: { resource: ENTITY_NAME } }),
      );
    });

    return {
      message: this.i18n.t('entity.createSuccess', {
        args: { resource: ENTITY_NAME },
      }),
      pet,
    };
  }

  @UseGuards(PetOwnershipGuard)
  @HttpCode(HttpStatus.OK)
  @Delete(ROUTES.DELETE)
  @ApiAppSuccessResponse(EmptyDto)
  async deletePet(@Param(REQUEST_PARAM.ENTITY_ID) pet_id: string) {
    const pet = await this.petService.findOne(pet_id).catch((_) => {
      throw new NotFoundException(this.i18n.t('entity.resourceNotFound'));
    });

    await this.petService.remove(pet_id).catch((_) => {
      throw new InternalServerErrorException(
        this.i18n.t('entity.deleteError', {
          args: { resource_id: pet_id, resoure: ENTITY_NAME },
        }),
      );
    });

    await this.petService.deleteAvatarImage(pet.avatar.file_name).catch((_) => {
      throw new InternalServerErrorException(
        this.i18n.t('entity.deleteAssociatedFileError', {
          args: { resource_id: pet_id, resoure: ENTITY_NAME },
        }),
      );
    });

    return {
      message: this.i18n.t('entity.deleteSuccess', {
        args: { resource: ENTITY_NAME, resource_id: pet_id },
      }),
    };
  }

  @UseGuards(PetOwnershipGuard)
  @HttpCode(HttpStatus.OK)
  @Get(ROUTES.GET)
  @ApiAppSuccessResponse(Pet, 'pet')
  async getPet(@Param(REQUEST_PARAM.ENTITY_ID) pet_id: string) {
    const pet = await this.petService.findOne(pet_id).catch((_) => {
      throw new NotFoundException(this.i18n.t('entity.resourceNotFound'));
    });

    return {
      message: this.i18n.t('entity.getResourceSuccess', {
        args: { resource: ENTITY_NAME },
      }),
      pet,
    };
  }

  @Get(ROUTES.LIST)
  @HttpCode(HttpStatus.OK)
  @ApiAppSuccessResponseArrayData(Pet)
  async listPet(
    @Res({ passthrough: true })
    response: ResLocals.FirebaseAuthenticatedRequest,
  ) {
    const user_id = response.locals.user_id;

    const pets = await this.petService.listPet(user_id).catch((_) => {
      throw new InternalServerErrorException(
        this.i18n.t('entity.operationOnResourceError', {
          args: {
            operation: this.i18n.t('operation.list'),
            resource: ENTITY_NAME,
          },
        }),
      );
    });

    return {
      message: this.i18n.t('entity.operationSuccess', {
        args: {
          operation: this.i18n.t('operation.list'),
          resource: ENTITY_NAME,
        },
      }),
      pets,
    };
  }

  @UseGuards(PetOwnershipGuard)
  @Post(ROUTES.UPLOAD_AVATAR)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor(REQUEST_PARAM.FILE_FIELD_NAME))
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
    @Param(REQUEST_PARAM.ENTITY_ID) pet_id: string,
  ) {
    /**
     * File temporary store is out side of try block
     */
    const TEMP_FILE_NAME = `${uuidv4()}`;
    const TEMP_FILE_PATH = path.resolve(__dirname, TEMP_FILE_NAME);
    await fs.writeFile(TEMP_FILE_PATH, file.buffer).catch((_) => {
      throw new InternalServerErrorException(this.i18n.t('app.preUploadError'));
    });

    try {
      const user_id = response.locals.user_id;

      const fileData = await this.petService
        .uploadAvatarImage({
          contentType: file.mimetype,
          customMetadata: {
            pet_id: pet_id,
            user_id,
          },
          file_name: TEMP_FILE_NAME,
          fileAbsolutePath: TEMP_FILE_PATH,
        })
        .catch((_) => {
          throw new InternalServerErrorException(
            this.i18n.t('entity.uploadAssociatedFileError', {
              args: {
                resource: ENTITY_NAME,
                resource_id: pet_id,
              },
            }),
          );
        });

      const pet = await this.petService.findOne(pet_id).catch((_) => {
        throw new NotFoundException(this.i18n.t('entity.resourceNotFound'));
      });

      // if file exist then delete before update
      if (!!pet.avatar?.file_id && !!pet.avatar?.file_name) {
        await this.petService
          .deleteAvatarImage(pet.avatar.file_name)
          .catch((_) => {
            throw new InternalServerErrorException(
              this.i18n.t('entity.deleteAssociatedFileError', {
                args: {
                  resource: ENTITY_NAME,
                  resource_id: pet_id,
                },
              }),
            );
          });
      }

      // then update record with new info
      await this.petService.update(pet_id, { avatar: fileData }).catch((_) => {
        throw new InternalServerErrorException(
          this.i18n.t('entity.operationOnResourceError', {
            args: {
              operation: this.i18n.t('operation.update'),
              resource: ENTITY_NAME,
            },
          }),
        );
      });

      return {
        data: {
          pet: await this.petService.findOne(pet_id).catch((_) => {
            throw new NotFoundException(this.i18n.t('entity.resourceNotFound'));
          }),
        },
        message: this.i18n.t('entity.uploadAssociatedFileSuccess', {
          args: { resource: ENTITY_NAME, resource_id: pet_id },
        }),
      };
    } catch (err) {
      throw err;
    } finally {
      await fs.rm(TEMP_FILE_PATH);
    }
  }

  @UseGuards(PetOwnershipGuard)
  @HttpCode(HttpStatus.OK)
  @Patch(ROUTES.UPDATE)
  @ApiAppSuccessResponse(Pet, 'pet')
  async updatePet(
    @Param(REQUEST_PARAM.ENTITY_ID) pet_id: string,
    @Body()
    updatePetDto: UpdatePetDto,
  ) {
    const updatedData = await this.petService
      .update(pet_id, updatePetDto)
      .catch((_) => {
        throw new InternalServerErrorException(
          this.i18n.t('entity.operationOnResourceError', {
            args: {
              operation: this.i18n.t('operation.update'),
              resource: ENTITY_NAME,
            },
          }),
        );
      });

    return {
      message: this.i18n.t('entity.operationSuccess', {
        args: {
          operation: this.i18n.t('operation.update'),
          resource: ENTITY_NAME,
        },
      }),
      pet: updatedData,
    };
  }
}
