import { Body, Controller, Get, Post } from '@nestjs/common';
import { LLMService } from 'src/common/langchain/llm.service';

@Controller('llm')
export class LLMController {
  constructor(private readonly llmService: LLMService) {}

  @Post('prompt')
  async genericPrompt(@Body() data: { question: string }) {
    // return 'asss';

    return await this.llmService.geolocationPrompt(data.question);
  }
}
