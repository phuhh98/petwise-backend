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
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { FirebaseAuthenticationGuard } from 'src/common/guards/firebase-authentication.guard';
import { GooleAIFileServiceWrapper } from 'src/llm/langchain/googleServices/googleFileUpload.service';
import { LLMService } from 'src/llm/llm.service';
import { v4 as uuidv4 } from 'uuid';
import {
  PetDiaryDto,
  TravelAssisstantResDto,
  TravelAssitantQueryDto,
} from './llm.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ApiAppSuccessResponse } from 'src/common/decorators/generic-response.decorator';
import { FileUploadDto } from 'src/common/dto/common-request.dto';
import { PetProfileDtoNS } from 'src/pet/pet.dto';

@ApiTags('llm')
@ApiBearerAuth()
@Controller('llm')
@UseGuards(FirebaseAuthenticationGuard)
export class LLMController {
  constructor(
    private readonly llmService: LLMService,
    private readonly googleFileService: GooleAIFileServiceWrapper,
  ) {}

  @Post('travel-assistant')
  @HttpCode(HttpStatus.OK)
  @ApiAppSuccessResponse(TravelAssisstantResDto)
  async genericPrompt(@Body() query: TravelAssitantQueryDto) {
    return {
      data: await this.llmService.geolocation(query.question),
      message: 'Generation succeed',
    };
  }

  @Post('pet-profile-builder')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiAppSuccessResponse(PetProfileDtoNS.PetProfileDto)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'A short video of a pet',
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

  @Post('pet-diary-builder')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiAppSuccessResponse(PetDiaryDto)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'An image of pet',
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
}
