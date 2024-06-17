import { GoogleAIFileManager } from '@google/generative-ai/files';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GooleAIFileServiceWrapper {
  private fileManager = new GoogleAIFileManager(
    this.configService.get('GEMINI_API_KEY'),
  );

  constructor(
    private readonly configService: ConfigService<NodeJS.ProcessEnv>,
  ) {}

  public async deleteFile(fileId: string) {
    return await this.fileManager.deleteFile(fileId);
  }

  public async getFileMeta(fileId: string) {
    return await this.fileManager.getFile(fileId);
  }

  public async uploadFile({
    displayName,
    filePath,
    mimeType,
    name,
  }: {
    displayName: string;
    filePath: string;
    mimeType: string;
    name: string;
  }) {
    return await this.fileManager.uploadFile(filePath, {
      displayName,
      mimeType,
      name,
    });
  }
}
