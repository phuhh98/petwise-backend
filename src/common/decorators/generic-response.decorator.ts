import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { GenericSuccessResponseDto } from '../dto/app-response.dto';

export const ApiAppSuccessResponse = <TModel extends Type<any>>(
  model: TModel,
  dataSubFieldName: string | null = null,
) => {
  return applyDecorators(
    ApiExtraModels(GenericSuccessResponseDto, model),
    ApiOkResponse({
      schema: {
        title: `SuccessResponseFor${model.name}`,
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
        title: `SuccessResponseFor${model.name}`,
        allOf: [
          { $ref: getSchemaPath(GenericSuccessResponseDto) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
      },
    }),
  );
};
