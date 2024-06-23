import {
  FunctionDeclaration,
  FunctionDeclarationSchemaType,
} from '@google/generative-ai';

export const petDiaryJsonParser: FunctionDeclaration = {
  description: `Parse pet diary journal data from provided context into json format`,
  name: 'petDiaryJsonParser',
  parameters: {
    description:
      'Object contains key-value pair of pet behaviour and advices from provided context',
    properties: {
      actions: {
        description: `An array contains a list the pet actions in the provided video.
          If encounter any falsy values like null, undefined or unknown, do not include it in the array`,
        type: FunctionDeclarationSchemaType.ARRAY,
      },
      advice: {
        description: 'Specilized advice for the pet owner',
        type: FunctionDeclarationSchemaType.STRING,
      },
      emotions: {
        description:
          'An object contains a different criteria about pet emotion(s)',
        properties: {
          description: {
            description: 'A brief description of the pet emotion(s)',
            properties: {},
            type: FunctionDeclarationSchemaType.STRING,
          },
          primary_emotion: {
            description: 'The most recognizable emotion of the pet',
            properties: {},
            type: FunctionDeclarationSchemaType.STRING,
          },
          secondary_emotions: {
            description: 'An array of any secondary emotions of the pet',
            properties: {},
            type: FunctionDeclarationSchemaType.ARRAY,
          },
        },
        type: FunctionDeclarationSchemaType.OBJECT,
      },
      error: {
        description: 'Error message from provided context',
        properties: {},
        type: FunctionDeclarationSchemaType.STRING,
      },
      happiness_level: {
        description: 'Happiness level in range from 1 to 10',
        type: FunctionDeclarationSchemaType.NUMBER,
      },
    },

    required: ['actions', /*'emotions',*/ 'advice', 'happiness_level'],
    type: FunctionDeclarationSchemaType.OBJECT,
  },
};
