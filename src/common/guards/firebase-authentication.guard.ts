import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { I18nService } from 'nestjs-i18n';
import { ProviderTokens } from 'src/common/constants/provider-token.constant';
import { FirebaseAuthService } from 'src/common/services/firebase/firebase-auth.service';
import { I18nTranslations } from 'src/generated/i18n.generated';
import { ResLocals } from 'src/interfaces/express.interface';

@Injectable()
export class FirebaseAuthenticationGuard implements CanActivate {
  @Inject(ProviderTokens['FIREBASE_AUTH'])
  private readonly authService: FirebaseAuthService;

  constructor(private readonly i18n: I18nService<I18nTranslations>) {}

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context
      .switchToHttp()
      .getResponse<ResLocals.FirebaseAuthenticatedRequest>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException(
        this.i18n.t('authorization.authTokenIsMissing'),
      );
    }

    const payload = await this.authService.verifyUserToken(token).catch((_) => {
      throw new UnauthorizedException(
        this.i18n.t('authorization.invalidAuthToken'),
      );
    });
    // We're assigning the payload to the response.locals object here
    // so that we can access it in our route handlers
    response.locals.user_id = payload.uid;

    return true;
  }
}
