import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
} from '@langchain/core/prompts';

const travelAssistantSystemPrompt = SystemMessagePromptTemplate.fromTemplate(`
	Role: Tourism guidance assistant
	Job: Give general information about mentioned place include geography, history, culture and special cuisines.
	Fail safe: Formally sorry if the question is not related.

	User question: {question}
`);

export const travelAssistantPrompt = ChatPromptTemplate.fromMessages<{
  question: string;
}>([travelAssistantSystemPrompt]);
