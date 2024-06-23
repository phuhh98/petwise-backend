import {
  FunctionDeclaration,
  FunctionDeclarationSchemaType,
} from '@google/generative-ai';

export const petProfileJsonParser: FunctionDeclaration = {
  description: `Parse pet profile data from provided context into json format`,
  name: 'petProfileJsonParser',
  parameters: {
    description: 'Object which contains detail information from pet breed',
    properties: {
      appearance: {
        description: 'Key base info about the pet appearance',
        properties: {
          body: {
            description: "Pet's body appearance",
            properties: {
              build: {
                description: "Pet's body build",
                properties: {},
                type: FunctionDeclarationSchemaType.STRING,
              },
              tail: {
                description: 'Tail size, shape, and its furry state',
                properties: {},
                type: FunctionDeclarationSchemaType.STRING,
              },
            },
            type: FunctionDeclarationSchemaType.OBJECT,
          },
          coat: {
            description: 'Description related to its fur or skin',
            properties: {
              colors: {
                description: "Pet's colors",
                properties: {},
                type: FunctionDeclarationSchemaType.STRING,
              },
              type: {
                description: "Pet's fur or skin appearance",
                properties: {},
                type: FunctionDeclarationSchemaType.STRING,
              },
            },
            type: FunctionDeclarationSchemaType.OBJECT,
          },
          head: {
            description: "Pet's head appearance",
            properties: {
              ears: {
                description: 'Ears shape description',
                properties: {},
                type: FunctionDeclarationSchemaType.STRING,
              },
              eyes: {
                description: 'Eyes shape and colors',
                properties: {},
                type: FunctionDeclarationSchemaType.STRING,
              },
              nose: {
                description: 'Nose description',
                properties: {},
                type: FunctionDeclarationSchemaType.STRING,
              },
              shape: {
                description: 'Head shape',
                properties: {},
                type: FunctionDeclarationSchemaType.STRING,
              },
            },
            type: FunctionDeclarationSchemaType.OBJECT,
          },
          legs: {
            description: 'Size of legs',
            properties: {},
            type: FunctionDeclarationSchemaType.STRING,
          },
          size: {
            description: 'Size of the pet',
            properties: {},
            type: FunctionDeclarationSchemaType.STRING,
          },
        },
        type: FunctionDeclarationSchemaType.OBJECT,
      },
      breed: {
        description: 'Pet breed',
        properties: {},
        type: FunctionDeclarationSchemaType.STRING,
      },
      description: {
        description: 'A brief description of the pet breed',
        properties: {},
        type: FunctionDeclarationSchemaType.STRING,
      },
      error: {
        description: 'Error message from provided context',
        properties: {},
        type: FunctionDeclarationSchemaType.STRING,
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
      type: {
        description: 'type of pet - animal type',
        properties: {},
        type: FunctionDeclarationSchemaType.STRING,
      },
    },

    /**
     * Adding object properties in required fields will cause the return to be "unknown"
     * This is because inner props was not parsed in that case but the required will terminate the function
     * because it face required fields but could not resolve in the first level.
     * The function have to run several rounds in order to fully parse all of the nested value of our desired structure
     */
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
