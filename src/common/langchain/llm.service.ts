import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableMap } from '@langchain/core/runnables';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { generalAnswerParser } from './gemini_tools/generalAnswerExtractor';
import { geolocationParser } from './gemini_tools/geolocationParser';
import { petProfileJsonParser } from './gemini_tools/petProfileJsonParser';
import { GoogleCustomJSONOutputParser } from './outputParser/geminiJSONOutputParser';
import {
  geolocationPrompt,
  petProfileBuilderPrompt,
  travelAssistantPrompt,
} from './prompts';
import { petProfilebuilderUserMessage } from './prompts/messageComponents/petProfileBuilderPrompts';

@Injectable()
export class LLMService {
  private _geminiModel = new ChatGoogleGenerativeAI({
    apiKey:
      this.configService.get<NodeJS.ProcessEnv['GEMINI_API_KEY']>(
        'GEMINI_API_KEY',
      ),
    maxOutputTokens: 2048,
    model: 'gemini-1.5-flash-latest',
    // verbose: true,
  });

  private _geolocationChain = geolocationPrompt
    .pipe(
      this._geminiModel.bind({
        tools: [{ functionDeclarations: [geolocationParser] }],
      }),
    )
    .pipe(new GoogleCustomJSONOutputParser());

  private _travelAssitantChain = travelAssistantPrompt
    .pipe(
      this._geminiModel.bind({
        tools: [{ functionDeclarations: [generalAnswerParser] }],
      }),
    )
    .pipe(new GoogleCustomJSONOutputParser());

  private master = RunnableMap.from<
    | Parameters<typeof this._geolocationChain.invoke>[0]
    | Parameters<typeof this._travelAssitantChain.invoke>[0],
    {
      location: Awaited<ReturnType<typeof this.geolocationChain.invoke>>;
      message: Awaited<ReturnType<typeof this.travelAssitantChain.invoke>>;
    }
  >({
    location: this._geolocationChain,
    message: this._travelAssitantChain,
  });

  constructor(
    private readonly configService: ConfigService<NodeJS.ProcessEnv>,
  ) {}

  async geolocationPrompt(question: string) {
    return await this.master.invoke({ question });
  }

  async petProfileBuilderPrompt({
    fileUri,
    mimeType,
  }: {
    fileUri: string;
    mimeType: string;
  }) {
    const petProfileBuilderChain = petProfileBuilderPrompt
      .pipe(
        this._geminiModel.bind({
          tools: [{ functionDeclarations: [petProfileJsonParser] }],
        }),
      )
      .pipe(new GoogleCustomJSONOutputParser());

    return await petProfileBuilderChain.invoke({
      message: petProfilebuilderUserMessage({ fileUri, mimeType }),
    });
  }
}
