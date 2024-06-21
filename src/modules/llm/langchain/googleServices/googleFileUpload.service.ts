import { GoogleAIFileManager } from '@google/generative-ai/files';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProviderTokens } from 'src/common/constants/provider-token.constant';

@Injectable()
export class GooleAIFileServiceWrapper {
  @Inject(ProviderTokens['CONFIG_SERVICE'])
  private readonly configService: ConfigService<NodeJS.ProcessEnv>;

  private fileManagerSingleton: GoogleAIFileManager;

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

  get fileManager() {
    if (!this.fileManagerSingleton) {
      this.fileManagerSingleton = new GoogleAIFileManager(
        this.configService.get('GEMINI_API_KEY'),
      );
    }

    return this.fileManagerSingleton;
  }
}
