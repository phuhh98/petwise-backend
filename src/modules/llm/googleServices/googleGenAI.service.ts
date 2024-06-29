import {
  GenerativeModel,
  GoogleGenerativeAI,
  TaskType,
} from '@google/generative-ai';
import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from '@langchain/google-genai';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProviderTokens } from 'src/common/constants/provider-token.constant';

enum GenModelsEnum {
  'gemini-1.0-pro' = 'gemini-1.0-pro',
  'gemini-1.5-flash' = 'gemini-1.5-flash',
  'gemini-1.5-pro' = 'gemini-1.5-pro',
}

type GenModels = keyof typeof GenModelsEnum;

enum EmbeddingModelsEnum {
  'embedding-001' = 'embedding-001',
  'text-embedding-004' = 'text-embedding-004',
}

type EmbeddingModels = keyof typeof EmbeddingModelsEnum;

@Injectable()
export class GooleGenAIService {
  private _chatModels: Record<string, ChatGoogleGenerativeAI> = {};

  private _embeddingModels: Record<string, GoogleGenerativeAIEmbeddings> = {};
  private _genAIModel: Record<string, GenerativeModel> = {};
  @Inject(ProviderTokens['CONFIG_SERVICE'])
  private readonly configService: ConfigService<NodeJS.ProcessEnv>;

  public getChatModel(
    modelName: GenModels = GenModelsEnum['gemini-1.5-flash'],
    maxOutputTokens: number = 2000,
  ): ChatGoogleGenerativeAI {
    return this._chatModels[modelName]
      ? this._chatModels[modelName]
      : ((this._chatModels[modelName] = new ChatGoogleGenerativeAI({
          apiKey:
            this.configService.get<NodeJS.ProcessEnv['GEMINI_API_KEY']>(
              'GEMINI_API_KEY',
            ),
          maxOutputTokens: maxOutputTokens,
          model: modelName,
          // verbose: true,
        })),
        this._chatModels[modelName]);
  }

  public getEmbeddingModel(
    chunk_title: string,
    taskType: TaskType,
    modelName: EmbeddingModels = EmbeddingModelsEnum['embedding-001'],
  ): GoogleGenerativeAIEmbeddings {
    return this._embeddingModels[modelName]
      ? this._embeddingModels[modelName]
      : ((this._embeddingModels[modelName] = new GoogleGenerativeAIEmbeddings({
          apiKey:
            this.configService.get<NodeJS.ProcessEnv['GEMINI_API_KEY']>(
              'GEMINI_API_KEY',
            ),
          model: 'embedding-001',
          taskType,
          title: chunk_title,
        })),
        this._embeddingModels[modelName]);
  }

  public getGenAIModel(
    modelName: GenModels = GenModelsEnum['gemini-1.5-flash'],
  ): GenerativeModel {
    return this._genAIModel[modelName]
      ? this._genAIModel[modelName]
      : ((this._genAIModel[modelName] = new GoogleGenerativeAI(
          this.configService.get<NodeJS.ProcessEnv['GEMINI_API_KEY']>(
            'GEMINI_API_KEY',
          ),
        ).getGenerativeModel({
          model: modelName,
        })),
        this._genAIModel[modelName]);
  }
}
