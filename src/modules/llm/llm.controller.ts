import { FileState } from '@google/generative-ai/files';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import {
  BadRequestException,
  Body,
  Controller,
  FileTypeValidator,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UnprocessableEntityException,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FieldValue } from 'firebase-admin/firestore';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import _ from 'lodash';
import { I18nService } from 'nestjs-i18n';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { MAX_BATCH_SIZE } from 'src/common/constants/firebase.constant';
import { REGEX_PATTERN } from 'src/common/constants/regex.constant';
import { ApiAppSuccessResponse } from 'src/common/decorators/swagger/generic-response.decorator';
import { FileUploadDtoSwagger } from 'src/common/dtos/common-request.dto';
import { DiaryNS } from 'src/common/entities/diary.entity';
import { PetProfileNS } from 'src/common/entities/pet.entity';
import { FirebaseAuthenticationGuard } from 'src/common/guards/firebase-authentication.guard';
import { PetCareEmbeddingService } from 'src/common/services/petcare-embedding.service';
import { PetCareUploadedDocsService } from 'src/common/services/petcare-uploaded-docs.service';
import { createSHA256 } from 'src/common/utils/converter';
import { I18nTranslations } from 'src/generated/i18n.generated';
import { v4 as uuidv4 } from 'uuid';

import {
  EmbeddingMultiFileUploadDtoSwagger,
  EmbeddingUploadBodyDto,
  TravelAssitantQueryDto,
} from './dtos/request.dto';
import { TravelAssisstantResDto } from './dtos/response.dto';
import { GooleAIFileServiceWrapper } from './langchain/googleServices/googleFileUpload.service';
import { LLMService } from './llm.service';

const CONTROLLER_ROUTE_PATH = 'llm';

enum REQUEST_PARAM {
  FILE_FIELD_NAME = 'file',
  MULTIPLE_FILES_FIELD_NAME = 'files',
}

enum ROUTES {
  PET_DIARY_BUILDER = 'pet-diary-builder',
  PET_PROFILE_BUILDER = 'pet-profile-builder',
  PETCARE_DOCUMENT_UPLOAD = 'petcare-documents',
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
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly petCareEmbeddingService: PetCareEmbeddingService,
    private readonly petCareUploadedDocsService: PetCareUploadedDocsService,
  ) {}

  @Post(ROUTES.PETCARE_DOCUMENT_UPLOAD)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(AnyFilesInterceptor())
  // @ApiAppSuccessResponse()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Unstructure data about petcare',
    type: EmbeddingMultiFileUploadDtoSwagger,
  })
  async petCareUnstructureFileUpload(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            /**
             * 50MB in bytes
             */
            maxSize: 150 * 1024 * 1024,
          }),
          new FileTypeValidator({
            fileType: REGEX_PATTERN.EMBEDDING_SUPPORT_DOCUMENT_MIMETYPE,
          }),
        ],
      }),
    )
    files: Array<Express.Multer.File>,
    @Body()
    body: EmbeddingUploadBodyDto,
  ) {
    /**
     * File temporary store is out side of try block
     */
    const TEMP_FILE_PROPS: {
      fileName: string;
      filePath: string;
      originalname: string;
      sha256: string;
    }[] = [];
    await Promise.all(
      files.map(async (file) => {
        const tempFileName = `${uuidv4()}`;
        const tempFilePath = path.resolve(__dirname, tempFileName);
        await fs.writeFile(tempFilePath, file.buffer).catch((_) => {
          throw new InternalServerErrorException(
            this.i18n.t('app.preUploadError'),
          );
        });

        TEMP_FILE_PROPS.push({
          fileName: tempFileName,
          filePath: tempFilePath,
          originalname: file.originalname,
          sha256: '',
        });
      }),
    );

    const UPLOADING_SUBJECT = body.subject;

    try {
      /**
       * Step 1: create SHA for each temporary document and try to find it in petCareUploadedDocsRepository
       * if exist, fire a UnprocessableEntity with already uploaded file in the payload with the file name
       * else, create record to track all the uploaded files
       */

      await Promise.all(
        TEMP_FILE_PROPS.map(async (fileProps, index) => {
          const fileSHA256 = createSHA256(
            await fs.readFile(fileProps.filePath),
          );
          const existDocs = await this.petCareUploadedDocsService.findAll([
            { fieldPath: 'sha256_hash', opStr: '==', value: fileSHA256 },
          ]);
          if (existDocs.count > 0) {
            throw new BadRequestException(
              this.i18n.t('llm.petCareDocsDuplicate', {
                args: { file_name: fileProps.originalname },
              }),
            );
          } else {
            TEMP_FILE_PROPS.splice(index, 1, {
              ...fileProps,
              sha256: fileSHA256,
            });
          }
        }),
      );

      /**
       * Step 2: split documents into chunks
       */
      const splitter = new RecursiveCharacterTextSplitter({
        /**
         * TODO: Adjust these value to get better result in relevant search
         */
        chunkOverlap: 1200,
        chunkSize: 3000,
      });

      await Promise.all(
        /**
         * Process file one by one
         */
        TEMP_FILE_PROPS.map(async (tempFileProps) => {
          const fileDataLoader = new PDFLoader(tempFileProps.filePath, {
            parsedItemSeparator: '',
            splitPages: false,
          });

          const documents = await fileDataLoader.load();

          const docChunks = await splitter.splitDocuments(documents);
          const docChunkBatches = _.chunk(docChunks, MAX_BATCH_SIZE);

          /**
           * Step 3: call model to turn to vector and store results
           */
          await Promise.all(
            docChunkBatches.map(async (chunkBatch) => {
              const embeddingBatch = await Promise.all(
                chunkBatch.map(async (splittedDocument) => {
                  return {
                    chunk: splittedDocument.pageContent,
                    embedding: FieldValue.vector(
                      await this.llmService.embeddingText(
                        splittedDocument.pageContent,
                        UPLOADING_SUBJECT,
                      ),
                    ) as unknown as number[],
                  };
                }),
              );

              await this.petCareEmbeddingService.createMany(embeddingBatch);
            }),
          );

          await this.petCareUploadedDocsService.create({
            metadata: {
              original_file_name: tempFileProps.originalname,
              subject: UPLOADING_SUBJECT,
            },
            sha256_hash: tempFileProps.sha256,
          });
        }),
      );

      return {
        message: this.i18n.t('llm.petCareDocsUploadComplete'),
      };
    } finally {
      await Promise.all(
        TEMP_FILE_PROPS.map(async (tempFileProps) => {
          await fs.rm(tempFileProps.filePath).catch((_) => {
            throw new InternalServerErrorException(
              this.i18n.t('app.clearResourceError'),
            );
          });
        }),
      );
    }
  }

  @Post(ROUTES.PET_DIARY_BUILDER)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor(REQUEST_PARAM.FILE_FIELD_NAME))
  @ApiAppSuccessResponse(DiaryNS.DiaryGeneratedAnalysis)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'A video of a  pet',
    type: FileUploadDtoSwagger,
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
            fileType: REGEX_PATTERN.GOOGLE_API_SUPPORT_VIDEO_MIMETYPE,
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
    await fs.writeFile(TEMP_FILE_PATH, file.buffer).catch((_) => {
      throw new InternalServerErrorException(this.i18n.t('app.preUploadError'));
    });

    try {
      const fileUploadResult = await this.googleFileService
        .uploadFile({
          displayName: file.originalname,
          filePath: TEMP_FILE_PATH,
          mimeType: file.mimetype,
          name: TEMP_FILE_NAME,
        })
        .catch((_) => {
          throw new InternalServerErrorException(
            this.i18n.t('llm.videoUploadingFailed'),
          );
        });
      /**
       * Now have to check for file state
       * Possible file states are in the below url
       * https://ai.google.dev/api/rest/v1beta/files#state
       */

      let fileMeta = await this.googleFileService
        .getFileMeta(fileUploadResult.file.name)
        .catch((_) => {
          throw new InternalServerErrorException(
            this.i18n.t('llm.videoMetadataFailed'),
          );
        });

      while (fileMeta.state === FileState.PROCESSING) {
        process.stdout.write('.');
        // Sleep for 5 seconds
        await new Promise((resolve) => setTimeout(resolve, 5_000));
        // Fetch the file from the API again
        fileMeta = await this.googleFileService
          .getFileMeta(fileUploadResult.file.name)
          .catch((_) => {
            throw new InternalServerErrorException(
              this.i18n.t('llm.videoMetadataFailed'),
            );
          });
      }

      if (fileMeta.state === FileState.FAILED) {
        throw new UnprocessableEntityException(
          this.i18n.t('llm.videoProcessingFailed'),
        );
      }

      const promptRes = await this.llmService
        .petDiaryBuilder({
          fileUri: fileUploadResult.file.uri,
          mimeType: file.mimetype,
        })
        .catch((_) => {
          throw new InternalServerErrorException(
            this.i18n.t('llm.generationError'),
          );
        });

      await this.googleFileService
        .deleteFile(fileUploadResult.file.name)
        .catch((_) => {
          throw new InternalServerErrorException(
            this.i18n.t('app.clearResourceError'),
          );
        });

      return {
        data: { analysis: promptRes },
        message: this.i18n.t('llm.generationSuccess'),
      };
    } finally {
      await fs.rm(TEMP_FILE_PATH).catch((_) => {
        throw new InternalServerErrorException(
          this.i18n.t('app.clearResourceError'),
        );
      });
    }
  }

  @Post(ROUTES.PET_PROFILE_BUILDER)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor(REQUEST_PARAM.FILE_FIELD_NAME))
  @ApiAppSuccessResponse(PetProfileNS.PetProfile)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'A image of a pet',
    type: FileUploadDtoSwagger,
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
    await fs.writeFile(TEMP_FILE_PATH, file.buffer).catch((_) => {
      throw new InternalServerErrorException(this.i18n.t('app.preUploadError'));
    });

    try {
      const fileUploadResult = await this.googleFileService
        .uploadFile({
          displayName: file.originalname,
          filePath: TEMP_FILE_PATH,
          mimeType: file.mimetype,
          name: TEMP_FILE_NAME,
        })
        .catch((_) => {
          throw new InternalServerErrorException(
            this.i18n.t('llm.imageUploadingFailed'),
          );
        });

      let fileMeta = await this.googleFileService
        .getFileMeta(fileUploadResult.file.name)
        .catch((_) => {
          throw new InternalServerErrorException(
            this.i18n.t('llm.imageMetadataFailed'),
          );
        });

      while (fileMeta.state === FileState.PROCESSING) {
        process.stdout.write('.');
        // Sleep for 1 seconds
        await new Promise((resolve) => setTimeout(resolve, 1_000));
        // Fetch the file from the API again
        fileMeta = await this.googleFileService
          .getFileMeta(fileUploadResult.file.name)
          .catch((_) => {
            throw new InternalServerErrorException(
              this.i18n.t('llm.imageMetadataFailed'),
            );
          });
      }

      if (fileMeta.state === FileState.FAILED) {
        throw new UnprocessableEntityException(
          this.i18n.t('llm.imageProcessingFailed'),
        );
      }

      const promptRes = await this.llmService
        .petProfileBuilder({
          fileUri: fileUploadResult.file.uri,
          mimeType: file.mimetype,
        })
        .catch((_) => {
          throw new InternalServerErrorException(
            this.i18n.t('llm.generationError'),
          );
        });

      this.googleFileService
        .deleteFile(fileUploadResult.file.name)
        .catch((_) => {
          throw new InternalServerErrorException(
            this.i18n.t('app.clearResourceError'),
          );
        });

      return { data: promptRes, message: this.i18n.t('llm.generationSuccess') };
    } finally {
      await fs.rm(TEMP_FILE_PATH);
    }
  }

  @Post(ROUTES.TRAVEL_ASSISTANT)
  @HttpCode(HttpStatus.OK)
  @ApiAppSuccessResponse(TravelAssisstantResDto)
  async travelAssistant(@Body() query: TravelAssitantQueryDto) {
    return {
      data: await this.llmService.geolocation(query.question).catch((_) => {
        throw new InternalServerErrorException(
          this.i18n.t('llm.generationError'),
        );
      }),
      message: this.i18n.t('llm.generationSuccess'),
    };
  }
}
