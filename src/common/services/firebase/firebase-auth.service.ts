import { Injectable } from '@nestjs/common';
import { getAuth } from 'firebase-admin/auth';

import app from '../../configs/firebase.config';

@Injectable()
export class FirebaseAuthService {
  private auth = getAuth(app);

  getAuth() {
    return this.auth;
  }

  /**
   * @param userIdToken
   * @returns Decoded user id token or throw error
   */
  async verifyUserToken(userIdToken: string) {
    return await this.auth.verifyIdToken(userIdToken);
  }
}
