import {
  FunctionDeclaration,
  FunctionDeclarationSchemaType,
} from '@google/generative-ai';

export const geolocationParser: FunctionDeclaration = {
  description: 'Parse geolocation information into json object format',
  name: 'geolocationParser',
  parameters: {
    properties: {
      geolocation: {
        description:
          'contain geolocation of a place contain cordinates and name of the place',
        properties: {
          ISO_A3: {
            description:
              'A3 ISO code of the country that this place belonged to',
            properties: {},
            type: FunctionDeclarationSchemaType.STRING,
          },
          lat: {
            description: 'latitude value',
            properties: {},
            type: FunctionDeclarationSchemaType.NUMBER,
          },
          lng: {
            description: 'longitude value',
            properties: {},
            type: FunctionDeclarationSchemaType.NUMBER,
          },
          place_name: {
            description: 'the place name',
            properties: {},
            type: FunctionDeclarationSchemaType.STRING,
          },
        },
        type: FunctionDeclarationSchemaType.OBJECT,
      },
    },
    required: ['geolocation'],
    type: FunctionDeclarationSchemaType.OBJECT,
  },
};

export type GeolocationResponse = {
  geolocation: {
    ISO_A3: string;
    lat: number;
    lng: number;
    place_name: string;
  };
};
