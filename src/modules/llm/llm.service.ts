import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableMap } from '@langchain/core/runnables';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProviderTokens } from 'src/common/constants/provider-token.constant';

import { TravelAssitantQueryDto } from './dtos/request.dto';
import {
  GeolocationResDto,
  PetDiaryBuilderResDto,
  PetProfileBuilderResDto,
  TravelAssisstantResDto,
} from './dtos/response.dto';
import { geolocationParser } from './langchain/gemini_tools/geolocationParser';
import { petDiaryJsonParser } from './langchain/gemini_tools/petDiaryJsonParser';
import { petProfileJsonParser } from './langchain/gemini_tools/petProfileJsonParser';
import { GoogleCustomJSONOutputParser } from './langchain/outputParser/geminiJSONOutputParser';
import {
  geolocationPrompt,
  petDiaryBuilderPrompt,
  petProfileBuilderPrompt,
  travelAssistantPrompt,
} from './langchain/prompts';
import { petDiaryBuilderHumanMessage } from './langchain/prompts/messageComponents/petDiaryBuilderPrompts';
import { petProfilebuilderHumanMessage } from './langchain/prompts/messageComponents/petProfileBuilderPrompts';

@Injectable()
export class LLMService {
  @Inject(ProviderTokens['CONFIG_SERVICE'])
  private readonly configService: ConfigService<NodeJS.ProcessEnv>;

  private llmModelSingleton: ChatGoogleGenerativeAI;

  async geolocation(question: string) {
    const geolocationChain = geolocationPrompt
      .pipe(
        this.geminiModel.bind({
          tools: [{ functionDeclarations: [geolocationParser] }],
        }),
      )
      .pipe<GeolocationResDto>(new GoogleCustomJSONOutputParser());

    const travelAssitantChain = travelAssistantPrompt
      .pipe(this.geminiModel)
      .pipe(new StringOutputParser());

    const master = RunnableMap.from<
      TravelAssitantQueryDto,
      TravelAssisstantResDto
    >({
      answer: travelAssitantChain,
      location: geolocationChain,
    });

    return await master.invoke({ question });
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
      .pipe(
        this.geminiModel.bind({
          tools: [{ functionDeclarations: [petDiaryJsonParser] }],
        }),
      )
      .pipe<PetDiaryBuilderResDto>(new GoogleCustomJSONOutputParser());

    return await petDiaryBuilderChain.invoke({
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
      .pipe(
        this.geminiModel.bind({
          tools: [{ functionDeclarations: [petProfileJsonParser] }],
        }),
      )
      .pipe<PetProfileBuilderResDto>(new GoogleCustomJSONOutputParser());

    return await petProfileBuilderChain.invoke({
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
