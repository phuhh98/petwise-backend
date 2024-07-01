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
import { travelAssistantPrompt } from './prompts/travelAssistantSystemPrompt';
import {
  receiptExtractorMediaMessage,
  receiptExtractorParser,
  receiptExtractorPrompt,
} from './prompts/receiptExtractorPrompt';
import {
  createToolCallingAgent,
  AgentExecutor,
  AgentStep,
  AgentFinish,
} from 'langchain/agents';
import { receiptExtractorValidation } from './tools/receiptExtractorValidation.tool';
import { tool, StructuredToolInterface } from '@langchain/core/tools';
import { RunnableSequence } from '@langchain/core/runnables';
import {
  HumanMessage,
  BaseMessage,
  FunctionMessage,
  AIMessage,
} from '@langchain/core/messages';

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
    const formatAgentSteps = (steps: AgentStep[]): BaseMessage[] =>
      steps.flatMap(({ action, observation }) => {
        if ('messageLog' in action && action.messageLog !== undefined) {
          const log = action.messageLog as BaseMessage[];
          return log.concat(new FunctionMessage(observation, action.tool));
        } else {
          return [new AIMessage(action.log)];
        }
      });

    const llmWithTools = this.googleGenAIService
      .getChatModel()
      .bindTools([receiptExtractorValidation]);

    const runnableAgent = RunnableSequence.from<{
      format_instructions: string;
      mediaMessage: HumanMessage;
      steps: Array<AgentStep>;
    }>([
      {
        format_instructions: (i) => i.format_instructions,
        mediaMessage: (i) => i.mediaMessage,
        agent_scratchpad: (i) => formatAgentSteps(i.steps),
      },
      receiptExtractorPrompt,
      llmWithTools,
      receiptExtractorParser,
    ]);

    // const agent = await createToolCallingAgent({
    //   llm: this.googleGenAIService.getChatModel(),
    //   tools: [
    //     receiptExtractorValidation as unknown as StructuredToolInterface<any>,
    //   ],
    //   prompt: receiptExtractorPrompt,

    // });

    // const agentExecutor = new AgentExecutor({
    //   agent,
    //   tools: [
    //     receiptExtractorValidation as unknown as StructuredToolInterface<any>,
    //   ],
    // });

    const executor = AgentExecutor.fromAgentAndTools({
      agent: runnableAgent,
      tools: [
        receiptExtractorValidation as unknown as StructuredToolInterface<any>,
      ],
    });

    // const receiptExtractorChain = receiptExtractorPrompt
    //   .pipe(this.googleGenAIService.getChatModel())
    //   .pipe(receiptExtractorParser);

    // return await receiptExtractorChain.invoke({
    //   format_instructions: receiptExtractorParser.getFormatInstructions(),
    //   mediaMessage: receiptExtractorMediaMessage(filesMeta),
    // });

    return executor.invoke({
      format_instructions: receiptExtractorParser.getFormatInstructions(),
      mediaMessage: receiptExtractorMediaMessage(filesMeta),
    });
  }
}
