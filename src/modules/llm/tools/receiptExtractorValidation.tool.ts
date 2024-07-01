import { z, ZodEffects } from 'zod';
import { tool, StructuredTool } from '@langchain/core/tools';
import { receiptExtractorSchema } from '../prompts/receiptExtractorPrompt';
import {
  FunctionDeclaration,
  FunctionDeclarationSchema,
  FunctionDeclarationSchemaType,
} from '@google/generative-ai';

const funcSchema: FunctionDeclarationSchema = {
  type: FunctionDeclarationSchemaType.OBJECT,
  /** The format of the parameter. */
  properties: {
    receipt_date: {
      type: FunctionDeclarationSchemaType.STRING,
      description: 'The issued date of the bill or receipt in ISO 8601 format',
    },
    currency: {
      type: FunctionDeclarationSchemaType.STRING,
      description:
        'Short name of currency being used in the bill in ISO 4217 format',
    },
    total_receipt_price: {
      type: FunctionDeclarationSchemaType.NUMBER,
      description: 'The bill total price after discount',
    },
    items: {
      type: FunctionDeclarationSchemaType.ARRAY,
      description: 'List of bought items with details',
      items: {
        type: FunctionDeclarationSchemaType.OBJECT,
        properties: {
          name: {
            type: FunctionDeclarationSchemaType.STRING,
            description: "Item's name from the image. No translation.",
          },
          quantity: {
            type: FunctionDeclarationSchemaType.NUMBER,
            description: 'Bought quantity of this item',
          },
          price: {
            type: FunctionDeclarationSchemaType.NUMBER,
            description: 'Price of a single item',
          },
          price_total: {
            type: FunctionDeclarationSchemaType.NUMBER,
            description: 'Total price of this item',
          },
        },
      },
    },
  },
  /** Optional. Description of the parameter. */
  description: 'Receipt details',
  /** Optional. Array of required parameters. */
  // required: string[];
};

export const receiptExtractorValidation: FunctionDeclaration &
  Record<string, any> = {
  name: 'receiptExtractorValidation',
  description:
    "Validate each receipt item's price and total receipt prices against the items list",
  parameters: funcSchema,
  invoke: async (
    input: z.infer<typeof receiptExtractorSchema>,
  ): Promise<string> => {
    const {
      success,
      data: receiptData,
      error,
    } = receiptExtractorSchema.safeParse(input);

    if (!success) {
      return `The provided params has the following issue: ${error.toString()}`;
    }

    // Validate each item in the list
    const itemsListIssue = receiptData.items
      .map((item) => {
        const isValid = item.price * item.quantity === item.price_total;

        if (!isValid) {
          return `Item ${item.name}'s price_total is not equal to it's price*quantity`;
        }

        return '';
      })
      .filter((issue) => issue.length !== 0);

    if (itemsListIssue.length !== 0) {
      return `Item in items list is not valid, with the following erros: ${itemsListIssue.join('; ')}`;
    }

    // Validate total price
    const isTotalPriceValid =
      receiptData.total_receipt_price ===
      receiptData.items.reduce((total, item) => total + item.price_total, 0);

    if (!isTotalPriceValid) {
      return `Receipt total price is invalid. total_receipt_price is not equal to sum of each item price_total from the list `;
    }

    return 'The provided receipt data is valid';
  },
};

// export const receiptExtractorValidation = tool(
//   async (input: z.infer<typeof receiptExtractorSchema>): Promise<string> => {
//     const {
//       success,
//       data: receiptData,
//       error,
//     } = receiptExtractorSchema.safeParse(input);

//     if (!success) {
//       return `The provided params has the following issue: ${error.toString()}`;
//     }

//     // Validate each item in the list
//     const itemsListIssue = receiptData.items
//       .map((item) => {
//         const isValid = item.price * item.quantity === item.price_total;

//         if (!isValid) {
//           return `Item ${item.name}'s price_total is not equal to it's price*quantity`;
//         }

//         return '';
//       })
//       .filter((issue) => issue.length !== 0);

//     if (itemsListIssue.length !== 0) {
//       return `Item in items list is not valid, with the following erros: ${itemsListIssue.join('; ')}`;
//     }

//     // Validate total price
//     const isTotalPriceValid =
//       receiptData.total_receipt_price ===
//       receiptData.items.reduce((total, item) => total + item.price_total, 0);

//     if (!isTotalPriceValid) {
//       return `Receipt total price is invalid. total_receipt_price is not equal to sum of each item price_total from the list `;
//     }

//     return 'The provided receipt data is valid';
//   },
//   {
//     name: 'receiptExtractorValidation',
//     description:
//       "Validate each receipt item's price and total receipt prices against the items list",
//     schema: receiptExtractorSchema,
//   },
// );
