import { Type, applyDecorators } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  getSchemaPath,
} from '@nestjs/swagger';

import { SuccessResponseDto } from '../../dtos/app-response.dto';

export const ApiAppSuccessResponse = <TModel extends Type<any>>(
  model: TModel,
  dataSubFieldName: null | string = null,
) => {
  return applyDecorators(
    ApiExtraModels(SuccessResponseDto, model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(SuccessResponseDto) },
          {
            properties: {
              data: {
                allOf: !dataSubFieldName
                  ? [{ $ref: getSchemaPath(model) }]
                  : [],
                properties: dataSubFieldName
                  ? {
                      [dataSubFieldName]: {
                        allOf: [{ $ref: getSchemaPath(model) }],
                      },
                    }
                  : {},
              },
            },
          },
        ],
        title: `SuccessResponseFor${model.name}`,
      },
    }),
  );
};

export const ApiAppCreateSuccessResponse = <TModel extends Type<any>>(
  model: TModel,
  dataSubFieldName: null | string = null,
) => {
  return applyDecorators(
    ApiExtraModels(SuccessResponseDto, model),
    ApiCreatedResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(SuccessResponseDto) },
          {
            properties: {
              data: {
                allOf: !dataSubFieldName
                  ? [{ $ref: getSchemaPath(model) }]
                  : [],
                properties: dataSubFieldName
                  ? {
                      [dataSubFieldName]: {
                        allOf: [{ $ref: getSchemaPath(model) }],
                      },
                    }
                  : {},
              },
            },
          },
        ],
        title: `SuccessResponseFor${model.name}`,
      },
    }),
  );
};

export const ApiAppSuccessResponseArrayData = <TModel extends Type<any>>(
  model: TModel,
) => {
  return applyDecorators(
    ApiExtraModels(SuccessResponseDto, model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(SuccessResponseDto) },
          {
            properties: {
              data: {
                items: { $ref: getSchemaPath(model) },
                type: 'array',
              },
            },
          },
        ],
        title: `SuccessResponseFor${model.name}`,
      },
    }),
  );
};
