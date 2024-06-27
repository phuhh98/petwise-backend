import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
} from '@langchain/core/prompts';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { z } from 'zod';

const geoLocationSystemPrompt = SystemMessagePromptTemplate.fromTemplate(`
  Job: Find the country that the place in user question is mentioned and return the country's capital geolocation
  User question: {question}
  {format_instructions}
`);

export const geoLocationOutputParser = StructuredOutputParser.fromZodSchema(
  z.object({
    ISO_A3: z
      .string()
      .describe('A3 ISO code of the country that this place belonged to'),
    lat: z.string().describe('latitude value'),
    lng: z.string().describe('longitude value'),
    place_name: z.string().describe('the place name'),
  }),
);

export const geolocationPrompt = ChatPromptTemplate.fromMessages<{
  format_instructions: string;
  question: string;
}>([geoLocationSystemPrompt]);
