import {
  FunctionDeclaration,
  FunctionDeclarationSchemaType,
} from '@google/generative-ai';

export const petProfileJsonParser: FunctionDeclaration = {
  description: `Parse pet profile data from provided context into json format
                If could not parse any required arguments to the desired format, omit it it response instead of return unknown`,
  name: 'petProfileJsonParser',
  parameters: {
    description: 'object which contains detail information from pet breed',
    properties: {
      type: {
        description: 'type of pet - animal type',
        properties: {},
        type: FunctionDeclarationSchemaType.STRING,
      },
      breed: {
        description: 'the pet breed',
        properties: {},
        type: FunctionDeclarationSchemaType.STRING,
      },
      description: {
        description: 'A brief description of the pet breed',
        properties: {},
        type: FunctionDeclarationSchemaType.STRING,
      },
      appearance: {
        description: 'key base info about the pet appearance',
        properties: {
          size: {
            description: 'Size of the pet, coulbe Small, Medium, Large..etc',
            properties: {},
            type: FunctionDeclarationSchemaType.STRING,
          },
          coat: {
            description: 'description related to its fur or skin',
            properties: {
              colors: {
                description: 'the pet color from the image',
                properties: {},
                type: FunctionDeclarationSchemaType.STRING,
              },
              type: {
                description: 'pet appearance, related to its fur or skin',
                properties: {},
                type: FunctionDeclarationSchemaType.STRING,
              },
            },
            type: FunctionDeclarationSchemaType.OBJECT,
          },
          head: {
            description: "pet's head appearance",
            properties: {
              shape: {
                description: 'Shape of the pet head',
                properties: {},
                type: FunctionDeclarationSchemaType.STRING,
              },
              ears: {
                description: 'Ear shape description',
                properties: {},
                type: FunctionDeclarationSchemaType.STRING,
              },
              eyes: {
                description: 'Eye shape and color',
                properties: {},
                type: FunctionDeclarationSchemaType.STRING,
              },
              nose: {
                description: 'Nose description',
                properties: {},
                type: FunctionDeclarationSchemaType.STRING,
              },
            },
            type: FunctionDeclarationSchemaType.OBJECT,
          },
          body: {
            description: "pet's body appearance",
            properties: {
              build: {
                description: 'body build',
                properties: {},
                type: FunctionDeclarationSchemaType.STRING,
              },
              tail: {
                description: 'tail size, shape, and furry state',
                properties: {},
                type: FunctionDeclarationSchemaType.STRING,
              },
            },
            type: FunctionDeclarationSchemaType.OBJECT,
          },
          legs: {
            description: 'size of its legs',
            properties: {},
            type: FunctionDeclarationSchemaType.STRING,
          },
        },
        type: FunctionDeclarationSchemaType.OBJECT,
      },
      temperament: {
        description: "pet's personalities",
        properties: {
          barking_tendency: {
            description: 'would it be easily barking',
            properties: {},
            type: FunctionDeclarationSchemaType.STRING,
          },
          energy_level: {
            description: 'daily energy or mood',
            properties: {},
            type: FunctionDeclarationSchemaType.STRING,
          },
          personality: {
            description: 'the breed general personality',
            properties: {},
            type: FunctionDeclarationSchemaType.STRING,
          },
          trainability: {
            description: 'possibility to train',
            properties: {},
            type: FunctionDeclarationSchemaType.STRING,
          },
        },
        type: FunctionDeclarationSchemaType.OBJECT,
      },
      health: {
        description: "common breed's health info",
        properties: {
          common_health_issues: {
            description: 'common health issue with this breed',
            properties: {},
            type: FunctionDeclarationSchemaType.STRING,
          },
          lifespan: {
            description: 'the breed general life span',
            properties: {},
            type: FunctionDeclarationSchemaType.STRING,
          },
        },
        type: FunctionDeclarationSchemaType.OBJECT,
      },
      grooming: {
        description: 'pet and owners shared activities',
        properties: {
          bathing: {
            description: 'how often should the owner let the pet takes a bath',
            properties: {},
            type: FunctionDeclarationSchemaType.STRING,
          },
          frequency: {
            description: 'frequency to take care of the pet',
            properties: {},
            type: FunctionDeclarationSchemaType.STRING,
          },
        },
        type: FunctionDeclarationSchemaType.OBJECT,
      },
      exercise: {
        description: 'pet and owners shared activities',
        properties: {
          needs: {
            description: 'Suggest activity to make the pet happy',
            properties: {},
            type: FunctionDeclarationSchemaType.STRING,
          },
          suitable_for: {
            description: 'Suggest kind owners to have this pet breed',
            properties: {},
            type: FunctionDeclarationSchemaType.STRING,
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

    required: [
      'type',
      'breed',
      'description',
      // 'appearance',
      // 'temperament',
      // 'health',
      // 'grooming',
      // 'exercise',
    ],
    type: FunctionDeclarationSchemaType.OBJECT,
  },
};
