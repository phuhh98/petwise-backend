import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { GooleAIFileServiceWrapper } from 'src/common/googleServices/googleFileUpload.service';
import { LLMService } from 'src/common/langchain/llm.service';
import { v4 as uuidv4 } from 'uuid';

@Controller('llm')
export class LLMController {
  constructor(
    private readonly llmService: LLMService,
    private readonly googleFileService: GooleAIFileServiceWrapper,
  ) {}

  @Post('travel-assistant')
  @HttpCode(HttpStatus.OK)
  async genericPrompt(@Body() data: { question: string }) {
    return await this.llmService.geolocationPrompt(data.question);
  }

  /**
   * This endpoint should only handle image only
   * so need a filter for mimeTypes
   */
  @Post('pet-profile-builder')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async petProfilebuilder(@UploadedFile() file: Express.Multer.File) {
    /**
     * tam luu file vo local storage
     * sau do dung path da tao upload voi google api
     * sau khi upload lay ten va url roi run prompt
     * nhan lai ket qua prompt thi dung ten va url do xoa file ddi
     */
    const TEMP_FILE_NAME = `${uuidv4()}`;
    const TEMP_FILE_PATH = path.resolve(__dirname, TEMP_FILE_NAME);
    await fs.writeFile(TEMP_FILE_PATH, file.buffer);

    try {
      console.log(TEMP_FILE_NAME, file.originalname);

      const fileUploadResult = await this.googleFileService.uploadFile({
        displayName: file.originalname,
        filePath: TEMP_FILE_PATH,
        mimeType: file.mimetype,
        name: TEMP_FILE_NAME,
      });

      const promptRes = await this.llmService.petProfileBuilderPrompt({
        fileUri: fileUploadResult.file.uri,
        mimeType: file.mimetype,
      });

      this.googleFileService.deleteFile(fileUploadResult.file.name);

      return promptRes;
    } finally {
      await fs.rm(TEMP_FILE_PATH);
    }
  }
}
