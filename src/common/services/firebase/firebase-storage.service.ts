import { Inject, Injectable } from '@nestjs/common';
import { getStorage } from 'firebase-admin/storage';
import app from '../../configs/firebase.config';
import { ConfigService } from '@nestjs/config';
import { ProviderTokens } from 'src/common/constants/provider-token.constant';

@Injectable()
export class FirestorageService {
  private readonly storage = getStorage(app);
  @Inject(ProviderTokens['CONFIG_SERVICE'])
  private readonly configService: ConfigService<NodeJS.ProcessEnv>;

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
