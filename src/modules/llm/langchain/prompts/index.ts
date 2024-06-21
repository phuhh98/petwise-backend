import { HumanMessage } from '@langchain/core/messages';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';

import { geoLocationSystemPrompt } from './messageComponents/geolocationSystemPrompt';
import { petDiaryBuilderSystemPrompt } from './messageComponents/petDiaryBuilderPrompts';
import { petProfileBuilderSystemPrompt } from './messageComponents/petProfileBuilderPrompts';
import { travelAssistantSystemPrompt } from './messageComponents/travelAssistantSystemPrompt';
import { userQuestionPrompt } from './messageComponents/userQuestionPrompt';

export const geolocationPrompt = ChatPromptTemplate.fromMessages<{
  question: string;
}>([geoLocationSystemPrompt, userQuestionPrompt]);

export const travelAssistantPrompt = ChatPromptTemplate.fromMessages<{
  question: string;
}>([travelAssistantSystemPrompt, userQuestionPrompt]);

export const petProfileBuilderPrompt = ChatPromptTemplate.fromMessages<{
  message: HumanMessage;
}>([petProfileBuilderSystemPrompt, new MessagesPlaceholder('message')]);

export const petDiaryBuilderPrompt = ChatPromptTemplate.fromMessages<{
  message: HumanMessage;
  pet_profile?: string;
}>([petDiaryBuilderSystemPrompt, new MessagesPlaceholder('message')]);
