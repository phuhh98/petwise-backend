import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getStorage } from 'firebase-admin/storage';
import { ProviderTokens } from 'src/common/constants/provider-token.constant';

import app from '../../configs/firebase.config';

@Injectable()
export class FirestorageService {
  @Inject(ProviderTokens['CONFIG_SERVICE'])
  private readonly configService: ConfigService<NodeJS.ProcessEnv>;
  private readonly storage = getStorage(app);

  /**
   * Currently using free account to no custom bucket then =)))
   * @param bucketName
   * @returns
   */
  // getStoragebucket(bucketName: string) {
  //   return this.storage.bucket(bucketName);
  // }
  getStoragebucket() {
    return this.storage.bucket(
      this.configService.get<NodeJS.ProcessEnv['FIREBASE_STORAGE_BUCKET']>(
        'FIREBASE_STORAGE_BUCKET',
      ),
    );
  }
}
