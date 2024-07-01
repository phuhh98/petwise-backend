import { HumanMessage } from '@langchain/core/messages';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from '@langchain/core/prompts';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { z } from 'zod';

const receiptExtractorSystemPrompt = SystemMessagePromptTemplate.fromTemplate(`
  Your role: A cashier assistant
  Job: Analyze provided images of bill or receipt, return details of bill based on provided images, eliminate details that is overlapping in provided images.
    Depend on the currency being used, analyse which thousand and decimal is used for that currency/country then apply to convert number value into correct one wich only demical seperator.
    E.g.:   + VND use dot as thousand separtor and comma as decimal seperator. Original value: 12.000,32 (in VND) => converted number: 12000.32
            + USD use dot as decimal seperator and comma as thousand seperator. Original value:  3,100.2 (in USD) => converted number: 3100.2
    A list of item is typically enclose inside an upper and a lower row of seperators.
    E.g.: ----------------------------------------------
        The list of item is here
        ------------------------------------------------
    There is only on list of items in an entire bill - counted the overlap if there is more than 1 image provided.
    If any item in items list has null value in its properties, ignore/drop from items list.
    No duplicate item in the items list.
    Item's name is a understandable string, not column header.
    Allow to translate item's name to the language of the currency as long as it is understandable and keep it as abbreviation if it is abbr in orignal name. If not, keep the original name.
    Make sure price_total of each item in the items list is valid, refer this equation - tolerance error number for this calculation is less than 0.99 unit of currency: 
        price_total = quantity*price
    
    Make sure final calculated items list total price equal to the bill total price, refer to this equation:
        total_receipt_price = SUM price_total of every item in the list
    If not satisfy this condition, find where is the error and correct it.

    Use the provided tool to validate those mentioned value before stop and return

  {format_instructions}
`);

export const receiptExtractorSchema = z
  .object({
    receipt_date: z
      .date({ coerce: true })
      .describe('The issued date of the bill or receipt in ISO 8601 format'),
    currency: z
      .string()
      .describe(
        'Short name of currency being used in the bill in ISO 4217 format',
      )
      .toUpperCase(),
    total_receipt_price: z
      .number()
      .describe('The bill total price after discount'),
    items: z
      .array(
        z.object({
          name: z
            .string()
            .describe("Item's name from the image. No translation."),
          quantity: z.number().describe('Bought quantity of this item'),
          price: z.number().describe('Price of a single item'),
          price_total: z.number().describe('Total price of this item'),
        }),
      )
      .describe('List of bought items with details'),
    error: z.string().nullable().describe(`Error message.
            In case you can not process the image or the provided image is not bill or the provided image is not from a same bill,
            return error and make joke about the situation`),
  })
  .describe('Receipt details');

export const receiptExtractorParser = StructuredOutputParser.fromZodSchema(
  receiptExtractorSchema,
);

export const receiptExtractorMediaMessage = (
  imagesDetail: {
    fileUri: string;
    mimeType: string;
  }[],
) =>
  new HumanMessage({
    content: imagesDetail.map(({ fileUri, mimeType }) => ({
      fileUri,
      mimeType,
      type: 'media',
    })),
  });

export const receiptExtractorPrompt = ChatPromptTemplate.fromMessages<{
  format_instructions: string;
  mediaMessage: HumanMessage;
}>([
  receiptExtractorSystemPrompt,
  new MessagesPlaceholder('mediaMessage'),
  new MessagesPlaceholder('agent_scratchpad'),
]);
