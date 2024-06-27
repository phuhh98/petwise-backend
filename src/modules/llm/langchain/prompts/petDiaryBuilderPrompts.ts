import { HumanMessage } from '@langchain/core/messages';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from '@langchain/core/prompts';

// import {
//   FunctionDeclaration,
//   FunctionDeclarationSchemaType,
// } from '@google/generative-ai';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { z } from 'zod';

const petDiaryBuilderSystemPrompt = SystemMessagePromptTemplate.fromTemplate(`
  Your role: A vet specialist
  Job: Analyze provided video or image, return the pet behaviour in details and give advices to the pet owner in the provided format.
  Extra context: You could have some extra information about the pet in the following context:
    pet_profile: {pet_profile}

  {format_instructions}
`);

export const petDiaryOutputParser = StructuredOutputParser.fromZodSchema(
  z.object({
    actions: z.array(z.string().describe('Pet actions in the provided video')),
    advice: z.string().describe('Specilized advice for the pet owner'),
    emotions: z.object({
      description: z
        .string()
        .describe('A brief description of the pet emotions'),
      primary_emotion: z
        .string()
        .describe('The most recognizable emotion of the pet'),
      secondary_emotions: z.array(
        z.string().describe('any secondary emotions of the pet'),
      ),
    }),
    error: z
      .string()
      .nullable()
      .describe('Error message from provided context'),
    happiness_level: z
      .number()
      .describe('Happiness level in range from 1 to 10')
      .min(1)
      .max(10),
  }),
);

export const petDiaryBuilderHumanMessage = ({
  fileUri,
  mimeType,
}: {
  fileUri: string;
  mimeType: string;
}) =>
  new HumanMessage({
    content: [
      {
        fileUri,
        mimeType,
        type: 'media',
      },
      {
        text: 'Generate response based on the provided video',
        type: 'text',
      },
    ],
  });

export const petDiaryBuilderPrompt = ChatPromptTemplate.fromMessages<{
  format_instructions: string;
  message: HumanMessage;
  pet_profile?: string;
}>([petDiaryBuilderSystemPrompt, new MessagesPlaceholder('message')]);

// export const petDiaryJsonParser: FunctionDeclaration = {
//   description: `Parse pet diary journal data from provided context into json format`,
//   name: 'petDiaryJsonParser',
//   parameters: {
//     description:
//       'Object contains key-value pair of pet behaviour and advices from provided context',
//     properties: {
//       actions: {
//         description: `An array contains a list the pet actions in the provided video.
//             If encounter any falsy values like null, undefined or unknown, do not include it in the array`,
//         type: FunctionDeclarationSchemaType.ARRAY,
//       },
//       advice: {
//         description: 'Specilized advice for the pet owner',
//         type: FunctionDeclarationSchemaType.STRING,
//       },
//       emotions: {
//         description:
//           'An object contains a different criteria about pet emotion(s)',
//         properties: {
//           description: {
//             description: 'A brief description of the pet emotion(s)',
//             properties: {},
//             type: FunctionDeclarationSchemaType.STRING,
//           },
//           primary_emotion: {
//             description: 'The most recognizable emotion of the pet',
//             properties: {},
//             type: FunctionDeclarationSchemaType.STRING,
//           },
//           secondary_emotions: {
//             description: 'An array of any secondary emotions of the pet',
//             properties: {},
//             type: FunctionDeclarationSchemaType.ARRAY,
//           },
//         },
//         type: FunctionDeclarationSchemaType.OBJECT,
//       },
//       error: {
//         description: 'Error message from provided context',
//         properties: {},
//         type: FunctionDeclarationSchemaType.STRING,
//       },
//       happiness_level: {
//         description: 'Happiness level in range from 1 to 10',
//         type: FunctionDeclarationSchemaType.NUMBER,
//       },
//     },

//     required: ['actions', /*'emotions',*/ 'advice', 'happiness_level'],
//     type: FunctionDeclarationSchemaType.OBJECT,
//   },
// };
