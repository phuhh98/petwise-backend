import { HumanMessagePromptTemplate } from '@langchain/core/prompts';

export const userQuestionPrompt =
  HumanMessagePromptTemplate.fromTemplate('{question}');
