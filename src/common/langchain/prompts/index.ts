import { ChatPromptTemplate } from '@langchain/core/prompts';

import { geoLocationSystemPrompt } from './messageComponents/geolocationSystemPrompt';
import { travelAssistantSystemPrompt } from './messageComponents/travelAssistantSystemPrompt';
import { userQuestionPrompt } from './messageComponents/userQuestionPrompt';

export const geolocationPrompt = ChatPromptTemplate.fromMessages<{
  question: string;
}>([geoLocationSystemPrompt, userQuestionPrompt]);

export const travelAssistantPrompt = ChatPromptTemplate.fromMessages<{
  question: string;
}>([travelAssistantSystemPrompt, userQuestionPrompt]);
