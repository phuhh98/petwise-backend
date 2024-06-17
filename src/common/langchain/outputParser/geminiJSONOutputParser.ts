import { ChatGeneration, Generation } from '@langchain/core/outputs';
import { JsonOutputFunctionsParser } from 'langchain/output_parsers';

export class GoogleCustomJSONOutputParser extends JsonOutputFunctionsParser {
  constructor(
    config?: ConstructorParameters<typeof JsonOutputFunctionsParser>[0],
  ) {
    super(config);
  }

  static lc_name() {
    return 'GoogleCustomJSONOutputParser';
  }
  parseResult(generations: ChatGeneration[] | Generation[]): Promise<object> {
    const gen = generations[0];
    const tool_calls = (
      (gen as any).message?.tool_calls as Record<string, any>[]
    ).reverse();
    const jsonData = tool_calls[0].args;
    return jsonData ?? {};
  }
}
