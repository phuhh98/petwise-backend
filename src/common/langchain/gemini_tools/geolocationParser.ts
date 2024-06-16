import {
  FunctionDeclaration,
  FunctionDeclarationSchemaType,
} from '@google/generative-ai';

export const geolocationParser: FunctionDeclaration = {
  description: 'Parse geolocation from provided context into json format',
  name: 'geolocationParser',
  parameters: {
    description:
      'geolocation object which contains cordinates and name of the place',
    properties: {
      ISO_A3: {
        description: 'A3 ISO code of the country that this place belonged to',
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
    required: ['ISO_A3', 'lat', 'lng', 'place_name'],
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
