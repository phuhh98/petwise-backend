import { FileState } from '@google/generative-ai/files';
import {
  Body,
  Controller,
  FileTypeValidator,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { ApiAppSuccessResponse } from 'src/common/decorators/swagger/generic-response.decorator';
import { FileUploadDto } from 'src/common/dto/common-request.dto';
import { FirebaseAuthenticationGuard } from 'src/common/guards/firebase-authentication.guard';
import { PetProfileDtoNS } from 'src/modules/pet/dto/pet.dto';
import { v4 as uuidv4 } from 'uuid';

import { GooleAIFileServiceWrapper } from './langchain/googleServices/googleFileUpload.service';
import {
  PetDiaryDto,
  TravelAssisstantResDto,
  TravelAssitantQueryDto,
} from './llm.dto';
import { LLMService } from './llm.service';

const CONTROLLER_ROUTE_PATH = 'llm';

enum REQUEST_PARAM {
  FILE_FIELD_NAME = 'file',
}

enum ROUTES {
  PET_DIARY_BUILDER = 'pet-diary-builder',
  PET_PROFILE_BUILDER = 'pet-profile-builder',
  TRAVEL_ASSISTANT = 'travel-assistant',
}

@ApiTags(CONTROLLER_ROUTE_PATH)
@ApiBearerAuth()
@Controller(CONTROLLER_ROUTE_PATH)
@UseGuards(FirebaseAuthenticationGuard)
export class LLMController {
  constructor(
    private readonly llmService: LLMService,
    private readonly googleFileService: GooleAIFileServiceWrapper,
  ) {}

  @Post(ROUTES.PET_DIARY_BUILDER)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor(REQUEST_PARAM.FILE_FIELD_NAME))
  @ApiAppSuccessResponse(PetDiaryDto)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'A video of a  pet',
    type: FileUploadDto,
  })
  async petDiaryBuilder(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            /**
             * 100MB in bytes
             */
            maxSize: 100 * 1024 * 1024,
          }),
          /**
           * Google File API supported formats for videos
           * https://ai.google.dev/gemini-api/docs/prompting_with_media?lang=node#video_formats
           */
          new FileTypeValidator({
            fileType: /video\/(mp4|mpeg|mov|avi|x-flv|mpg|webm|wmv|3gpp)/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    /**
     * File temporary store is out side of try block
     */
    const TEMP_FILE_NAME = `${uuidv4()}`;
    const TEMP_FILE_PATH = path.resolve(__dirname, TEMP_FILE_NAME);
    await fs.writeFile(TEMP_FILE_PATH, file.buffer);

    try {
      const fileUploadResult = await this.googleFileService.uploadFile({
        displayName: file.originalname,
        filePath: TEMP_FILE_PATH,
        mimeType: file.mimetype,
        name: TEMP_FILE_NAME,
      });
      /**
       * Now have to check for file state
       * Possible file states are in the below url
       * https://ai.google.dev/api/rest/v1beta/files#state
       */

      let fileMeta = await this.googleFileService.getFileMeta(
        fileUploadResult.file.name,
      );
      while (fileMeta.state === FileState.PROCESSING) {
        process.stdout.write('.');
        // Sleep for 5 seconds
        await new Promise((resolve) => setTimeout(resolve, 5_000));
        // Fetch the file from the API again
        fileMeta = await this.googleFileService.getFileMeta(
          fileUploadResult.file.name,
        );
      }

      if (fileMeta.state === FileState.FAILED) {
        throw new Error('Video processing failed.');
      }

      const promptRes = await this.llmService.petDiaryBuilder({
        fileUri: fileUploadResult.file.uri,
        mimeType: file.mimetype,
      });

      this.googleFileService.deleteFile(fileUploadResult.file.name);

      return { data: { analysis: promptRes }, message: 'Generation succeed' };
    } finally {
      await fs.rm(TEMP_FILE_PATH);
    }
  }

  @Post(ROUTES.PET_PROFILE_BUILDER)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor(REQUEST_PARAM.FILE_FIELD_NAME))
  @ApiAppSuccessResponse(PetProfileDtoNS.PetProfileDto)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'A image of a pet',
    type: FileUploadDto,
  })
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
  ) {
    /**
     * File temporary store is out side of try block
     */
    const TEMP_FILE_NAME = `${uuidv4()}`;
    const TEMP_FILE_PATH = path.resolve(__dirname, TEMP_FILE_NAME);
    await fs.writeFile(TEMP_FILE_PATH, file.buffer);

    try {
      const fileUploadResult = await this.googleFileService.uploadFile({
        displayName: file.originalname,
        filePath: TEMP_FILE_PATH,
        mimeType: file.mimetype,
        name: TEMP_FILE_NAME,
      });

      let fileMeta = await this.googleFileService.getFileMeta(
        fileUploadResult.file.name,
      );
      while (fileMeta.state === FileState.PROCESSING) {
        process.stdout.write('.');
        // Sleep for 1 seconds
        await new Promise((resolve) => setTimeout(resolve, 1_000));
        // Fetch the file from the API again
        fileMeta = await this.googleFileService.getFileMeta(
          fileUploadResult.file.name,
        );
      }

      if (fileMeta.state === FileState.FAILED) {
        throw new Error('Image processing failed.');
      }

      const promptRes = await this.llmService.petProfileBuilder({
        fileUri: fileUploadResult.file.uri,
        mimeType: file.mimetype,
      });

      this.googleFileService.deleteFile(fileUploadResult.file.name);

      return { data: promptRes, message: 'Generation succeed' };
    } finally {
      await fs.rm(TEMP_FILE_PATH);
    }
  }

  @Post(ROUTES.TRAVEL_ASSISTANT)
  @HttpCode(HttpStatus.OK)
  @ApiAppSuccessResponse(TravelAssisstantResDto)
  async travelAssistant(@Body() query: TravelAssitantQueryDto) {
    return {
      data: await this.llmService.geolocation(query.question),
      message: 'Generation succeed',
    };
  }
}
