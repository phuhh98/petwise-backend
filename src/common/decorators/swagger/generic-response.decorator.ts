import { Type, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

import { GenericSuccessResponseDto } from '../../dto/app-response.dto';

export const ApiAppSuccessResponse = <TModel extends Type<any>>(
  model: TModel,
  dataSubFieldName: null | string = null,
) => {
  return applyDecorators(
    ApiExtraModels(GenericSuccessResponseDto, model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(GenericSuccessResponseDto) },
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
    ApiExtraModels(GenericSuccessResponseDto, model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(GenericSuccessResponseDto) },
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
