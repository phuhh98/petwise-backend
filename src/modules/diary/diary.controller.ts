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
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
import { I18nService } from 'nestjs-i18n';
import fs from 'node:fs/promises';
import path from 'node:path';
import { REGEX_PATTERN } from 'src/common/constants/regex.constant';
import {
  ApiAppCreateSuccessResponse,
  ApiAppSuccessResponse,
  ApiAppSuccessResponseArrayData,
} from 'src/common/decorators/swagger/generic-response.decorator';
import {
  EmptyDto,
  FileUploadDtoSwagger,
} from 'src/common/dtos/common-request.dto';
import { DiaryEntitySwagger } from 'src/common/entities/diary.entity';
import { FirebaseAuthenticationGuard } from 'src/common/guards/firebase-authentication.guard';
import { DiaryService } from 'src/common/services/diary.service';
import { I18nTranslations } from 'src/generated/i18n.generated';
import { ResLocals } from 'src/interfaces/express.interface';
import { v4 as uuidv4 } from 'uuid';

import {
  CreateDiaryDto,
  ListDiaryQueryDto,
  UpdateDiaryDto,
} from './dtos/request.dto';
import {
  CreatDiaryResDto,
  DeleteDiaryResDto,
  GetDiaryResDto,
  ListDiaryResDto,
  UpdateDiaryResDto,
  UploadImageResDto,
} from './dtos/response.dto';
import { DiaryOwnershipGuard } from './guards/diary-ownership.guard';
import { PetQueryOwnershipGuard } from './guards/pet-payload-ownership.guard';

const ENTITY_NAME = 'diary';
const ENTITY_PATH = ENTITY_NAME;
const CONTROLLER_ROUTE_PATH = ENTITY_NAME;

enum REQUEST_PARAM {
  ENTITY_ID = `${ENTITY_NAME}_id`,
  FILE_FIELD_NAME = 'file',
}

enum ROUTES {
  CREATE = ENTITY_PATH,
  DELETE = `${ENTITY_PATH}/:${REQUEST_PARAM.ENTITY_ID}`,
  GET = `${ENTITY_PATH}/:${REQUEST_PARAM.ENTITY_ID}`,
  LIST = 'list',
  UPDATE = `${ENTITY_PATH}/:${REQUEST_PARAM.ENTITY_ID}`,
  UPLOAD_IMAGE = `${ENTITY_PATH}/:${REQUEST_PARAM.ENTITY_ID}/image`,
}

@ApiTags(CONTROLLER_ROUTE_PATH)
@ApiBearerAuth()
@Controller(CONTROLLER_ROUTE_PATH)
@UseGuards(FirebaseAuthenticationGuard)
export class DiaryController {
  constructor(
    private readonly diaryService: DiaryService,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  @Post(ROUTES.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PetQueryOwnershipGuard)
  @ApiAppCreateSuccessResponse(DiaryEntitySwagger, ENTITY_NAME)
  async createDiary(
    @Body()
    createDiaryDto: CreateDiaryDto,
    @Res({ passthrough: true })
    response: ResLocals.FirebaseAuthenticatedRequest,
  ): Promise<CreatDiaryResDto> {
    const user_id = response.locals.user_id;
    createDiaryDto.user_id = user_id;
    /**
     * Default of diary_date will be the date on server
     */
    createDiaryDto.diary_date =
      createDiaryDto.diary_date ?? new Date().toISOString();

    const diary = await this.diaryService.create(createDiaryDto).catch((_) => {
      throw new InternalServerErrorException(
        this.i18n.t('entity.createError', { args: { resource: ENTITY_NAME } }),
      );
    });

    return plainToClass(CreatDiaryResDto, {
      [ENTITY_NAME]: diary,
      message: this.i18n.t('entity.createSuccess', {
        args: { resource: ENTITY_NAME },
      }),
    });
  }

  @UseGuards(DiaryOwnershipGuard)
  @HttpCode(HttpStatus.OK)
  @Delete(ROUTES.DELETE)
  @ApiAppSuccessResponse(EmptyDto)
  async deleteDiary(
    @Param(REQUEST_PARAM.ENTITY_ID) diary_id: string,
  ): Promise<DeleteDiaryResDto> {
    const diary = await this.diaryService.findOne(diary_id).catch((_) => {
      throw new NotFoundException(this.i18n.t('entity.resourceNotFound'));
    });

    await this.diaryService.remove(diary_id).catch((_) => {
      throw new InternalServerErrorException(
        this.i18n.t('entity.deleteError', {
          args: { resource_id: diary_id, resoure: ENTITY_NAME },
        }),
      );
    });

    // if file exist then delete
    if (!!diary.image?.file_id && !!diary.image?.file_name) {
      await this.diaryService.deleteImage(diary.image.file_name).catch((_) => {
        throw new InternalServerErrorException(
          this.i18n.t('entity.deleteAssociatedFileError', {
            args: {
              resource: ENTITY_NAME,
              resource_id: diary_id,
            },
          }),
        );
      });
    }

    return plainToClass(DeleteDiaryResDto, {
      message: this.i18n.t('entity.deleteSuccess', {
        args: { resource: ENTITY_NAME, resource_id: diary },
      }),
    });
  }

  @UseGuards(DiaryOwnershipGuard)
  @HttpCode(HttpStatus.OK)
  @Get(ROUTES.GET)
  @ApiAppSuccessResponse(DiaryEntitySwagger, ENTITY_NAME)
  async getDiary(
    @Param(REQUEST_PARAM.ENTITY_ID) diary_id: string,
  ): Promise<GetDiaryResDto> {
    const diary = await this.diaryService.findOne(diary_id).catch((_) => {
      throw new NotFoundException(this.i18n.t('entity.resourceNotFound'));
    });

    return plainToClass(GetDiaryResDto, {
      [ENTITY_NAME]: diary,
      message: this.i18n.t('entity.getResourceSuccess', {
        args: { resource: ENTITY_NAME },
      }),
    });
  }

  @UseGuards(PetQueryOwnershipGuard)
  @Get(ROUTES.LIST)
  @HttpCode(HttpStatus.OK)
  @ApiAppSuccessResponseArrayData(DiaryEntitySwagger)
  async listDiaryByPetId(
    @Res({ passthrough: true })
    response: ResLocals.FirebaseAuthenticatedRequest,
    @Query()
    query: ListDiaryQueryDto,
  ): Promise<ListDiaryResDto> {
    const user_id = response.locals.user_id;

    const diaries = await this.diaryService
      .listDiary(
        { pet_id: query.pet_id, user_id },
        {
          max_items: query.max_items,
          page: query.page,
          sort: {
            order: query.order,
            sortKey: query.orderBy,
          },
        },
      )
      .catch((_) => {
        throw new InternalServerErrorException(
          this.i18n.t('entity.operationOnResourceError', {
            args: {
              operation: this.i18n.t('operation.list'),
              resource: ENTITY_NAME,
            },
          }),
        );
      });

    return plainToClass(ListDiaryResDto, {
      diaries,
      message: this.i18n.t('entity.operationSuccess', {
        args: {
          operation: this.i18n.t('operation.list'),
          resource: ENTITY_NAME,
        },
      }),
    });
  }

  @UseGuards(DiaryOwnershipGuard)
  @HttpCode(HttpStatus.OK)
  @Patch(ROUTES.UPDATE)
  @ApiAppSuccessResponse(DiaryEntitySwagger, ENTITY_NAME)
  async updateDiary(
    @Param(REQUEST_PARAM.ENTITY_ID) diary_id: string,
    @Body()
    updateDiaryDto: UpdateDiaryDto,
  ): Promise<UpdateDiaryResDto> {
    const updatedData = await this.diaryService
      .update(diary_id, updateDiaryDto)
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

    return plainToClass(UpdateDiaryResDto, {
      [ENTITY_NAME]: updatedData,
      message: this.i18n.t('entity.operationSuccess', {
        args: {
          operation: this.i18n.t('operation.update'),
          resource: ENTITY_NAME,
        },
      }),
    });
  }

  @UseGuards(DiaryOwnershipGuard)
  @Post(ROUTES.UPLOAD_IMAGE)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor(REQUEST_PARAM.FILE_FIELD_NAME))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'A image of a pet',
    type: FileUploadDtoSwagger,
  })
  @ApiAppSuccessResponse(DiaryEntitySwagger, ENTITY_NAME)
  async uploadDiaryImage(
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
            fileType: REGEX_PATTERN.GOOGLE_API_SUPPORT_IMAGE_MIMETYPE,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Res({ passthrough: true })
    response: ResLocals.FirebaseAuthenticatedRequest,
    @Param(REQUEST_PARAM.ENTITY_ID) diary_id: string,
  ): Promise<UploadImageResDto> {
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

      const diary = await this.diaryService.findOne(diary_id).catch((_) => {
        throw new NotFoundException(this.i18n.t('entity.resourceNotFound'));
      });

      const fileData = await this.diaryService
        .uploadImage({
          contentType: file.mimetype,
          customMetadata: {
            diary_id,
            pet_id: diary.pet_id,
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
                resource_id: diary_id,
              },
            }),
          );
        });

      // if file exist then delete before update
      if (!!diary.image?.file_id && !!diary.image?.file_name) {
        await this.diaryService
          .deleteImage(diary.image.file_name)
          .catch((_) => {
            throw new InternalServerErrorException(
              this.i18n.t('entity.deleteAssociatedFileError', {
                args: {
                  resource: ENTITY_NAME,
                  resource_id: diary_id,
                },
              }),
            );
          });
      }

      // then update record with new info
      await this.diaryService
        .update(diary_id, { image: fileData })
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

      return plainToClass(UploadImageResDto, {
        data: {
          [ENTITY_NAME]: await this.diaryService
            .findOne(diary_id)
            .catch((_) => {
              throw new NotFoundException(
                this.i18n.t('entity.resourceNotFound'),
              );
            }),
        },
        message: this.i18n.t('entity.uploadAssociatedFileSuccess', {
          args: { resource: ENTITY_NAME, resource_id: diary_id },
        }),
      });
    } catch (err) {
      throw err;
    } finally {
      await fs.rm(TEMP_FILE_PATH);
    }
  }
}
