import {
  FunctionDeclaration,
  FunctionDeclarationSchemaType,
} from '@google/generative-ai';

export const petDiaryJsonParser: FunctionDeclaration = {
  description:
    'Parse pet diary journal data from provided context into json format',
  name: 'petDiaryJsonParser',
  parameters: {
    description:
      'Json object contains key-value pair of pet behaviour info from provided context',
    properties: {
      actions: {
        description:
          'An array contains a list of brief description of the pet actions in the provided video',
        type: FunctionDeclarationSchemaType.ARRAY,
      },
      advice: {
        description:
          'Specilized advice for the pet owner if in the pet shows any negative symptom in health or emotion regard to its breed normal state',
        type: FunctionDeclarationSchemaType.STRING,
      },
      emotions: {
        description:
          'An array contains a list of the pet actions in the provided video',
        properties: {
          description: {
            description:
              'A brief description of the pet emotion(s) in the video',
            properties: {},
            type: FunctionDeclarationSchemaType.STRING,
          },
          primary_emotion: {
            description:
              'The main emotion of the pet in the video, most regconizable one',
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
        description:
          'Error message from prompt when it is out of scope of this prompt',
        properties: {},
        type: FunctionDeclarationSchemaType.STRING,
      },
    },

    required: ['actions', 'emotions', 'advice'],
    type: FunctionDeclarationSchemaType.OBJECT,
  },
};
