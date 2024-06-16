import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { RunnableMap } from '@langchain/core/runnables';
import { JsonOutputFunctionsParser } from 'langchain/output_parsers';
import { StringOutputParser } from '@langchain/core/output_parsers';

import { geolocationPrompt, travelAssistantPrompt } from './prompts';

import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import {
  geolocationParser,
  GeolocationResponse,
} from './gemini_tools/geolocationParser';
import {
  generalAnswerParser,
  GeneralAnswerResponse,
} from './gemini_tools/generalAnswerExtractor';

@Injectable()
export class LLMService {
  private geminiModel = new ChatGoogleGenerativeAI({
    apiKey: this.configService.get('GEMINI_API_KEY'),
    model: 'gemini-1.5-flash-latest',
    maxOutputTokens: 2048,
    verbose: true,
  });

  private geolocationChain = geolocationPrompt
    .pipe(
      this.geminiModel.bind({
        tools: [{ functionDeclarations: [geolocationParser] }],
      }),
    )
    // .pipe(new JsonOutputFunctionsParser<GeolocationResponse>());
    .pipe(new StringOutputParser());

  private travelAssitantChain = travelAssistantPrompt
    .pipe(
      this.geminiModel.bind({
        tools: [{ functionDeclarations: [generalAnswerParser] }],
      }),
    )
    // .pipe(new JsonOutputFunctionsParser<GeneralAnswerResponse>());
    .pipe(new StringOutputParser());

  private master = RunnableMap.from<
    | Parameters<typeof this.geolocationChain.invoke>[0]
    | Parameters<typeof this.travelAssitantChain.invoke>[0],
    {
      location: Awaited<ReturnType<typeof this.geolocationChain.invoke>>;
      message: Awaited<ReturnType<typeof this.travelAssitantChain.invoke>>;
    }
  >({
    location: this.geolocationChain,
    message: this.travelAssitantChain,
  });

  constructor(
    private readonly configService: ConfigService<NodeJS.ProcessEnv>,
  ) {}

  async geolocationPrompt(question: string) {
    return await this.master.invoke({ question });
  }
}
