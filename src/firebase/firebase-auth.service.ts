import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getAuth } from 'firebase-admin/auth';
import app from './firebase.config';

@Injectable()
export class FirebaseAuthService {
  private auth = getAuth(app);
  constructor(
    private readonly configService: ConfigService<NodeJS.ProcessEnv>,
  ) {}

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
