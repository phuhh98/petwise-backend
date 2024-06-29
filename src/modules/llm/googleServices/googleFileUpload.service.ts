import { GoogleAIFileManager } from '@google/generative-ai/server';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProviderTokens } from 'src/common/constants/provider-token.constant';

@Injectable()
export class GooleFileUploadService {
  private _fileManager: GoogleAIFileManager;
  @Inject(ProviderTokens['CONFIG_SERVICE'])
  private readonly configService: ConfigService<NodeJS.ProcessEnv>;
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

  get fileManager(): GoogleAIFileManager {
    return this._fileManager
      ? this._fileManager
      : ((this._fileManager = new GoogleAIFileManager(
          this.configService.get('GEMINI_API_KEY'),
        )),
        this._fileManager);
  }
}
