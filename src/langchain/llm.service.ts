import { RunnableMap } from '@langchain/core/runnables';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { generalAnswerParser } from './gemini_tools/generalAnswerExtractor';
import { geolocationParser } from './gemini_tools/geolocationParser';
import { petDiaryJsonParser } from './gemini_tools/petDiaryJsonParser';
import { petProfileJsonParser } from './gemini_tools/petProfileJsonParser';
import { GoogleCustomJSONOutputParser } from './outputParser/geminiJSONOutputParser';
import {
  geolocationPrompt,
  petDiaryBuilderPrompt,
  petProfileBuilderPrompt,
  travelAssistantPrompt,
} from './prompts';
import { petProfilebuilderHumanMessage } from './prompts/messageComponents/petProfileBuilderPrompts';

@Injectable()
export class LLMService {
  private geminiModel = new ChatGoogleGenerativeAI({
    apiKey:
      this.configService.get<NodeJS.ProcessEnv['GEMINI_API_KEY']>(
        'GEMINI_API_KEY',
      ),
    maxOutputTokens: 2048,
    model: 'gemini-1.5-flash-latest',
    // verbose: true,
  });

  constructor(
    private readonly configService: ConfigService<NodeJS.ProcessEnv>,
  ) {}

  async geolocation(question: string) {
    const geolocationChain = geolocationPrompt
      .pipe(
        this.geminiModel.bind({
          tools: [{ functionDeclarations: [geolocationParser] }],
        }),
      )
      .pipe(new GoogleCustomJSONOutputParser());

    const travelAssitantChain = travelAssistantPrompt
      .pipe(
        this.geminiModel.bind({
          tools: [{ functionDeclarations: [generalAnswerParser] }],
        }),
      )
      .pipe(new GoogleCustomJSONOutputParser());

    const master = RunnableMap.from<
      | Parameters<typeof geolocationChain.invoke>[0]
      | Parameters<typeof travelAssitantChain.invoke>[0],
      {
        location: Awaited<ReturnType<typeof this.geolocationChain.invoke>>;
        message: Awaited<ReturnType<typeof this.travelAssitantChain.invoke>>;
      }
    >({
      location: geolocationChain,
      message: travelAssitantChain,
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
      .pipe(new GoogleCustomJSONOutputParser());

    return await petDiaryBuilderChain.invoke({
      message: petProfilebuilderHumanMessage({ fileUri, mimeType }),
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
      .pipe(new GoogleCustomJSONOutputParser());

    return await petProfileBuilderChain.invoke({
      message: petProfilebuilderHumanMessage({ fileUri, mimeType }),
    });
  }
}
