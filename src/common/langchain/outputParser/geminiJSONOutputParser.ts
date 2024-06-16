import { ChatGeneration, Generation } from '@langchain/core/outputs';
import { JsonOutputFunctionsParser } from 'langchain/output_parsers';
import { inspect } from 'util';

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
    console.log('generations', inspect(generations[0], false, 4));
    const gen = generations[0];
    const jsonData = (gen as any).message?.tool_calls[0].args;
    return jsonData ?? {};
  }
}
