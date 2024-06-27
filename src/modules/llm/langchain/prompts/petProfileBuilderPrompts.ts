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

const petProfileBuilderSystemPrompt = SystemMessagePromptTemplate.fromTemplate(`
  Your role: A vet specialist
  Job: Analyze provided picture and return details about the pet in the picture in provided format
  
  {format_instructions}

`);

export const petProfileOutputParser = StructuredOutputParser.fromZodSchema(
  z.object({
    appearance: z.object({
      body: z.object({
        build: z
          .string()
          .describe(
            'Body build. Example: Sturdy, Ample, Chubby, Chunky, Portly, Lean, Svelte, Lanky, Lithe, Healthy, Muscular, Robust, Fit,...',
          ),
        tail: z.string().describe('Tail size, shape, and its furry state'),
      }),
      coat: z.object({
        colors: z.string().describe("Pet's colors"),
        type: z
          .string()
          .describe(
            'Pet fur or skin appearance. Example: Hairless, Smooth, Wire-haired, Longhaired, Double-coated, Curly, Silky, Fluffy, Wavy, Short-haired,...',
          ),
      }),
      head: z.object({
        ears: z
          .string()
          .describe(
            'Ear shape descriptions. Example: Prick, Floppy, Drop, Button, Rose, Bat, Cropped, Alert, Tipped, Folded,...',
          ),
        eyes: z
          .string()
          .describe(
            'Eye shape and colors. Example: Alert, Beady, Bright, Compelling, Expressive, Gleaming, Hypnotic, Luminous, Mysterious, Soulful,...',
          ),
        nose: z
          .string()
          .describe(
            'Nose description. Example: Petulant, Pert, Petite, Pickled, Piggy, Pinched, Pious, Pixie, Pliable, Pliant,...',
          ),
        shape: z
          .string()
          .describe(
            'Head shape. Example: Round, Oval, Triangular, Square, Angular, Wide, Narrow, Flat, Prominent, Tapered,...',
          ),
      }),
      legs: z
        .string()
        .describe(
          'Size of legs. Example: Aching, Bandy, Brawny, Chiseled, Curvaceous, Elastic, Graceless, Lanky, Lithe, Sinewy,...',
        ),
      size: z
        .string()
        .describe(
          'Size of the pet. Examples: Massive, Tiny, Huge, Minuscule, Enormous, Puny,...',
        ),
    }),
    breed: z.string().describe('Pet breed'),
    description: z
      .string()
      .describe(
        `A description of the pet breed. Description should be at least 7 sentences and can be up to 200 words.`,
      ),
    error: z.string().nullable()
      .describe(`Case not pet in picture or unrecognizable: Make joke or sarcarsm in a funny tone -do not offend the reader- and say that user provided something not a pet, given what is the object in the picture too.
                If there is no issue, let this field be null`),
    exercise: z.object({
      needs: z
        .string()
        .describe(
          'Suggested activities to make the pet happy. Example: Daily walks and playtime',
        ),
      suitable_for: z
        .string()
        .describe(
          'Suggested kind of owners to have this pet breed. Example: Active families, experienced dog owners',
        ),
    }),
    grooming: z.object({
      bathing: z
        .string()
        .describe(
          'Recommended pet bath frequency for this breed. Example: Regularly, Occasionally, Frequently, Infrequently, Weekly, Monthly, Daily, Seldom, Biweekly, Seasonally,...',
        ),
      frequency: z
        .string()
        .describe(
          'Recommended frequency have the pet groomed. Example: Regularly, Occasionally, Frequently, Infrequently, Weekly, Monthly, Daily, Seldom, Biweekly, Seasonally,...',
        ),
    }),
    health: z.object({
      common_health_issues: z
        .string()
        .describe(
          'Known common health issues with this breed during its lifetime',
        ),
      lifespan: z
        .string()
        .describe(
          'The breed general life span, could an exact year or approximate years',
        ),
    }),
    temperament: z.object({
      barking_tendency: z
        .string()
        .describe('Tendency for the pet to bark or make noisy sound.'),
      energy_level: z
        .string()
        .describe(
          'Daily energy or mood. Example: Joyful, Grateful, Excited, Optimistic, Energetic, Cheerful, Anxious, Resentful, Sad, Angry,...',
        ),
      personality: z
        .string()
        .describe(
          "Pet's breed general personality. Example: Affectionate, Agile, Alert, Brave, Calm, Caring, Cheerful, Clever, Curious, Dependable,...",
        ),
      trainability: z
        .string()
        .describe(
          'Short description about possibility to train this pet using these words: Trainable, Adaptable, Obedient, Quick learner, Cooperative, Responsive, Eager to please, Focused, Attentive, Intelligent,... ',
        ),
    }),
    type: z.string().describe('Type of pet - animal type'),
  }),
);

export const petProfilebuilderHumanMessage = ({
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
        text: 'From provided image make a profile for this pet',
        type: 'text',
      },
    ],
  });

export const petProfileBuilderPrompt = ChatPromptTemplate.fromMessages<{
  format_instructions: string;
  message: HumanMessage;
}>([petProfileBuilderSystemPrompt, new MessagesPlaceholder('message')]);

/**
 * This implementation is wrong
 * It should be used with functioncall not parsing data
 */
// export const petProfileJsonParser: FunctionDeclaration = {
//   description: `Parse pet profile data from provided context into json format`,
//   name: 'petProfileJsonParser',
//   parameters: {
//     description: 'Object which contains detail information from pet breed',
//     properties: {
//       appearance: {
//         description: 'Key base info about the pet appearance',
//         properties: {
//           body: {
//             description: "Pet's body appearance",
//             properties: {
//               build: {
//                 description: "Pet's body build",
//                 properties: {},
//                 type: FunctionDeclarationSchemaType.STRING,
//               },
//               tail: {
//                 description: 'Tail size, shape, and its furry state',
//                 properties: {},
//                 type: FunctionDeclarationSchemaType.STRING,
//               },
//             },
//             type: FunctionDeclarationSchemaType.OBJECT,
//           },
//           coat: {
//             description: 'Description related to its fur or skin',
//             properties: {
//               colors: {
//                 description: "Pet's colors",
//                 properties: {},
//                 type: FunctionDeclarationSchemaType.STRING,
//               },
//               type: {
//                 description: "Pet's fur or skin appearance",
//                 properties: {},
//                 type: FunctionDeclarationSchemaType.STRING,
//               },
//             },
//             type: FunctionDeclarationSchemaType.OBJECT,
//           },
//           head: {
//             description: "Pet's head appearance",
//             properties: {
//               ears: {
//                 description: 'Ears shape description',
//                 properties: {},
//                 type: FunctionDeclarationSchemaType.STRING,
//               },
//               eyes: {
//                 description: 'Eyes shape and colors',
//                 properties: {},
//                 type: FunctionDeclarationSchemaType.STRING,
//               },
//               nose: {
//                 description: 'Nose description',
//                 properties: {},
//                 type: FunctionDeclarationSchemaType.STRING,
//               },
//               shape: {
//                 description: 'Head shape',
//                 properties: {},
//                 type: FunctionDeclarationSchemaType.STRING,
//               },
//             },
//             type: FunctionDeclarationSchemaType.OBJECT,
//           },
//           legs: {
//             description: 'Size of legs',
//             properties: {},
//             type: FunctionDeclarationSchemaType.STRING,
//           },
//           size: {
//             description: 'Size of the pet',
//             properties: {},
//             type: FunctionDeclarationSchemaType.STRING,
//           },
//         },
//         type: FunctionDeclarationSchemaType.OBJECT,
//       },
//       breed: {
//         description: 'Pet breed',
//         properties: {},
//         type: FunctionDeclarationSchemaType.STRING,
//       },
//       description: {
//         description: 'A brief description of the pet breed',
//         properties: {},
//         type: FunctionDeclarationSchemaType.STRING,
//       },
//       error: {
//         description: 'Error message from provided context',
//         properties: {},
//         type: FunctionDeclarationSchemaType.STRING,
//       },
//       exercise: {
//         description: 'pet and owners shared activities',
//         properties: {
//           needs: {
//             description: 'Suggest activity to make the pet happy',
//             properties: {},
//             type: FunctionDeclarationSchemaType.STRING,
//           },
//           suitable_for: {
//             description: 'Suggest kind owners to have this pet breed',
//             properties: {},
//             type: FunctionDeclarationSchemaType.STRING,
//           },
//         },
//         type: FunctionDeclarationSchemaType.OBJECT,
//       },
//       grooming: {
//         description: 'pet and owners shared activities',
//         properties: {
//           bathing: {
//             description: 'how often should the owner let the pet takes a bath',
//             properties: {},
//             type: FunctionDeclarationSchemaType.STRING,
//           },
//           frequency: {
//             description: 'frequency to take care of the pet',
//             properties: {},
//             type: FunctionDeclarationSchemaType.STRING,
//           },
//         },
//         type: FunctionDeclarationSchemaType.OBJECT,
//       },
//       health: {
//         description: "common breed's health info",
//         properties: {
//           common_health_issues: {
//             description: 'common health issue with this breed',
//             properties: {},
//             type: FunctionDeclarationSchemaType.STRING,
//           },
//           lifespan: {
//             description: 'the breed general life span',
//             properties: {},
//             type: FunctionDeclarationSchemaType.STRING,
//           },
//         },
//         type: FunctionDeclarationSchemaType.OBJECT,
//       },
//       temperament: {
//         description: "pet's personalities",
//         properties: {
//           barking_tendency: {
//             description: 'would it be easily barking',
//             properties: {},
//             type: FunctionDeclarationSchemaType.STRING,
//           },
//           energy_level: {
//             description: 'daily energy or mood',
//             properties: {},
//             type: FunctionDeclarationSchemaType.STRING,
//           },
//           personality: {
//             description: 'the breed general personality',
//             properties: {},
//             type: FunctionDeclarationSchemaType.STRING,
//           },
//           trainability: {
//             description: 'possibility to train',
//             properties: {},
//             type: FunctionDeclarationSchemaType.STRING,
//           },
//         },
//         type: FunctionDeclarationSchemaType.OBJECT,
//       },
//       type: {
//         description: 'type of pet - animal type',
//         properties: {},
//         type: FunctionDeclarationSchemaType.STRING,
//       },
//     },

//     /**
//      * Adding object properties in required fields will cause the return to be "unknown"
//      * This is because inner props was not parsed in that case but the required will terminate the function
//      * because it face required fields but could not resolve in the first level.
//      * The function have to run several rounds in order to fully parse all of the nested value of our desired structure
//      */
//     required: [
//       'type',
//       'breed',
//       'description',
//       // 'appearance',
//       // 'temperament',
//       // 'health',
//       // 'grooming',
//       // 'exercise',
//     ],
//     type: FunctionDeclarationSchemaType.OBJECT,
//   },
// };
