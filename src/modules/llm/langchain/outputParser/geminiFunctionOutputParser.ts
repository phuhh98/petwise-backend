import { ChatGeneration, Generation } from '@langchain/core/outputs';
import { JsonOutputFunctionsParser } from 'langchain/output_parsers';

/**
 * TODO: Check langchain docs to update this implementation for gemini function return
 * this currently not the good one because we have to check other case when there are
 * more than one function call in response
 * Probe into JsonOutputFunctionsParser to see more
 */
export class GeminiFunctionOutputParser<
  Output extends object = object,
> extends JsonOutputFunctionsParser<Output> {
  'lc_namespace' = ['langchain', 'output_parsers', 'gemini_functions'];
  constructor(
    config?: ConstructorParameters<typeof JsonOutputFunctionsParser>[0],
  ) {
    super(config);
  }

  static lc_name() {
    return 'GeminiFunctionOutputParser';
  }
  async parseResult(
    generations: ChatGeneration[] | Generation[],
  ): Promise<any> {
    const gen = generations[0];
    const tool_calls = (
      (gen as any).message?.tool_calls as Record<string, any>[]
    ).reverse();
    const jsonData = tool_calls[0].args;
    return jsonData ?? {};
  }
}
