import {
  FunctionDeclaration,
  FunctionDeclarationSchemaType,
} from '@google/generative-ai';

export const generalAnswerParser: FunctionDeclaration = {
  description: 'parse answer and put it into object property',
  name: 'generalAnswerParser',
  parameters: {
    properties: {
      answer: {
        description: 'The answer goes here',
        type: FunctionDeclarationSchemaType.STRING,
      },
    },
    type: FunctionDeclarationSchemaType.OBJECT,
  },
};

export type GeneralAnswerResponse = {
  answer: string;
};
