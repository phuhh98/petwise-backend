import { TaskType } from '@google/generative-ai';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableMap } from '@langchain/core/runnables';
import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from '@langchain/google-genai';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProviderTokens } from 'src/common/constants/provider-token.constant';
import {
  petDiaryBuilderHumanMessage,
  petDiaryBuilderPrompt,
  petDiaryOutputParser,
} from 'src/modules/llm/langchain/prompts/petDiaryBuilderPrompts';
import {
  petProfileBuilderPrompt,
  petProfileOutputParser,
  petProfilebuilderHumanMessage,
} from 'src/modules/llm/langchain/prompts/petProfileBuilderPrompts';

import {
  geoLocationOutputParser,
  geolocationPrompt,
} from './langchain/prompts/geolocationSystemPrompt';
import { travelAssistantPrompt } from './langchain/prompts/travelAssistantSystemPrompt';

@Injectable()
export class LLMService {
  @Inject(ProviderTokens['CONFIG_SERVICE'])
  private readonly configService: ConfigService<NodeJS.ProcessEnv>;

  private llmModelSingleton: ChatGoogleGenerativeAI;

  embeddingModel(taskType: TaskType, chunk_title?: string) {
    return new GoogleGenerativeAIEmbeddings({
      apiKey:
        this.configService.get<NodeJS.ProcessEnv['GEMINI_API_KEY']>(
          'GEMINI_API_KEY',
        ),
      model: 'embedding-001',
      taskType,
      title: chunk_title,
    });
  }

  async embeddingText(chunk: string, subject: string) {
    return await this.embeddingModel(
      TaskType.RETRIEVAL_DOCUMENT,
      subject,
    ).embedQuery(chunk);
  }

  async geolocation(question: string) {
    const geolocationChain = geolocationPrompt
      .pipe(this.geminiModel)
      .pipe(geoLocationOutputParser);

    const travelAssitantChain = travelAssistantPrompt
      .pipe(this.geminiModel)
      .pipe(new StringOutputParser());

    const master = RunnableMap.from<
      Parameters<typeof geolocationChain.invoke>[0] &
        Parameters<typeof travelAssistantPrompt.invoke>[0]
    >({
      answer: travelAssitantChain,
      location: geolocationChain,
    });

    return await master.invoke({
      format_instructions: geoLocationOutputParser.getFormatInstructions(),
      question,
    });
  }

  async petDiaryBuilder({
    fileUri,
    mimeType,
    pet_profile,
  }: {
    fileUri: string;
    mimeType: string;
    pet_profile?: string;
  }) {
    const petDiaryBuilderChain = petDiaryBuilderPrompt
      .pipe(this.geminiModel)
      .pipe(petDiaryOutputParser);

    return await petDiaryBuilderChain.invoke({
      format_instructions: petDiaryOutputParser.getFormatInstructions(),
      message: petDiaryBuilderHumanMessage({ fileUri, mimeType }),
      pet_profile,
    });
  }

  async petProfileBuilder({
    fileUri,
    mimeType,
  }: {
    fileUri: string;
    mimeType: string;
  }) {
    const petProfileBuilderChain = petProfileBuilderPrompt
      .pipe(this.geminiModel)
      .pipe(petProfileOutputParser);

    return await petProfileBuilderChain.invoke({
      format_instructions: petProfileOutputParser.getFormatInstructions(),
      message: petProfilebuilderHumanMessage({ fileUri, mimeType }),
    });
  }

  get geminiModel() {
    if (!this.llmModelSingleton) {
      this.llmModelSingleton = new ChatGoogleGenerativeAI({
        apiKey:
          this.configService.get<NodeJS.ProcessEnv['GEMINI_API_KEY']>(
            'GEMINI_API_KEY',
          ),
        maxOutputTokens: 2048,
        model: 'gemini-1.5-flash',
        // verbose: true,
      });
    }
    return this.llmModelSingleton;
  }
}
