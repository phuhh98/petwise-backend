import {
  FunctionDeclaration,
  FunctionDeclarationSchemaType,
} from '@google/generative-ai';

export const petProfileJsonParser: FunctionDeclaration = {
  description: 'Parse pet profile data from provided context into json format',
  name: 'petProfileJsonParser',
  parameters: {
    description: 'object which contains detail information from pet breed',
    properties: {
      appearance: {
        description: 'key base info about the pet appearance',
        properties: {
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
          size: {
            description: 'Size of the pet, coulbe Small, Medium, Large..etc',
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
      breed: {
        description: 'the pet breed',
        properties: {},
        type: FunctionDeclarationSchemaType.STRING,
      },
      type: {
        description: 'type of pet - animal type',
        properties: {},
        type: FunctionDeclarationSchemaType.STRING,
      },
      description: {
        description: 'A brief description of the pet breed',
        properties: {},
        type: FunctionDeclarationSchemaType.STRING,
      },

      error: {
        description:
          'Error message from prompt when it is out of scope of this prompt',
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
          suitableFor: {
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
      head: {
        description: "pet's head appearance",
        properties: {
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
          shape: {
            description: 'Shape of the pet head',
            properties: {},
            type: FunctionDeclarationSchemaType.STRING,
          },
        },
        type: FunctionDeclarationSchemaType.OBJECT,
      },
      health: {
        description: "common breed's health info",
        properties: {
          commonHealthIssues: {
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
      legs: {
        description: 'size of its legs',
        properties: {},
        type: FunctionDeclarationSchemaType.STRING,
      },

      temperament: {
        description: "pet's personalities",
        properties: {
          barkingTendency: {
            description: 'would it be easily barking',
            properties: {},
            type: FunctionDeclarationSchemaType.STRING,
          },
          energyLevel: {
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
    },

    required: [
      'breed',
      'description',
      'appearance',
      'head',
      'body',
      'legs',
      'temperament',
      'health',
      'grooming',
      'exercises',
    ],
    type: FunctionDeclarationSchemaType.OBJECT,
  },
};

export type petProfileRepsonse = {
  appearance: {
    coat: {
      colors: string;
      type: string;
    };
    exercise: {
      needs: string;
      suitableFor: string;
    };
    grooming: {
      bathing: string;
      frequency: string;
    };
    head: {
      body: {
        build: string;
        tail: string;
      };
      ears: string;
      eyes: string;
      legs: string;
      nose: string;
      shape: string;
    };
    health: {
      commonHealthIssues: string;
      lifespan: string;
    };
    size: string;
    temperament: {
      barkingTendency: string;
      energyLevel: string;
      personality: string;
      trainability: string;
    };
  };
  breed: string;
  type: string;
  description: string;
  error: null | string;
};
