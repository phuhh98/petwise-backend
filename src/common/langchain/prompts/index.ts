import { ChatPromptTemplate } from '@langchain/core/prompts';
import { geoLocationSystemPrompt } from './messageComponents/geolocationSystemPrompt';
import { userQuestionPrompt } from './messageComponents/userQuestionPrompt';
import { travelAssistantSystemPrompt } from './messageComponents/travelAssistantSystemPrompt';

export const geolocationPrompt = ChatPromptTemplate.fromMessages<{
  question: string;
}>([geoLocationSystemPrompt, userQuestionPrompt]);

export const travelAssistantPrompt = ChatPromptTemplate.fromMessages<{
  question: string;
}>([travelAssistantSystemPrompt, userQuestionPrompt]);
