import { TaskType } from '@google/generative-ai';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableMap } from '@langchain/core/runnables';
import { Injectable } from '@nestjs/common';
import {
  petDiaryBuilderHumanMessage,
  petDiaryBuilderPrompt,
  petDiaryOutputParser,
} from 'src/modules/llm/prompts/petDiaryBuilderPrompts';
import {
  petProfileBuilderPrompt,
  petProfileOutputParser,
  petProfilebuilderHumanMessage,
} from 'src/modules/llm/prompts/petProfileBuilderPrompts';

import { GooleGenAIService } from './googleServices/googleGenAI.service';
import {
  geoLocationOutputParser,
  geolocationPrompt,
} from './prompts/geolocationSystemPrompt';
import {
  receiptExtractorMediaMessage,
  receiptExtractorParser,
  receiptExtractorPrompt,
} from './prompts/receiptExtractorPrompt';
import { travelAssistantPrompt } from './prompts/travelAssistantSystemPrompt';

/**
 * TODO: Split model to another class which expose method to get preconfigure model with extra params
 *      make it injectable, currently this file handle too much of logic
 *     + expose method to get Genmodel to make call to count token
 * +  Expose limit input token of current used model
 */
@Injectable()
export class LLMService {
  constructor(private readonly googleGenAIService: GooleGenAIService) {}

  async embeddingText(chunk: string, subject: string) {
    return await this.googleGenAIService
      .getEmbeddingModel(TaskType.RETRIEVAL_DOCUMENT, 'embedding-001', subject)
      .embedQuery(chunk);
  }

  async geolocation(question: string) {
    const geolocationChain = geolocationPrompt
      .pipe(this.googleGenAIService.getChatModel())
      .pipe(geoLocationOutputParser);

    const travelAssitantChain = travelAssistantPrompt
      .pipe(this.googleGenAIService.getChatModel())
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
      .pipe(this.googleGenAIService.getChatModel())
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
      .pipe(this.googleGenAIService.getChatModel())
      .pipe(petProfileOutputParser);

    return await petProfileBuilderChain.invoke({
      format_instructions: petProfileOutputParser.getFormatInstructions(),
      message: petProfilebuilderHumanMessage({ fileUri, mimeType }),
    });
  }

  async receiptExtractor(
    filesMeta: {
      fileUri: string;
      mimeType: string;
    }[],
  ) {
    const receiptExtractorChain = receiptExtractorPrompt
      .pipe(this.googleGenAIService.getChatModel())
      .pipe(receiptExtractorParser);

    return await receiptExtractorChain.invoke({
      format_instructions: receiptExtractorParser.getFormatInstructions(),
      mediaMessage: receiptExtractorMediaMessage(filesMeta),
    });
  }
}
