import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { I18nService } from 'nestjs-i18n';
import { DiaryService } from 'src/common/services/diary.service';
import { I18nTranslations } from 'src/generated/i18n.generated';
import { ResLocals } from 'src/interfaces/express.interface';

/**
 * Route guard to validate user ownership of a diary base on :diary_id request nvm route param
 * Use on single diary access endpoints except CREATE endpoint
 * Required to include FirebaseAuthenticationGuard before to let user_id available in response.locals
 */
@Injectable()
export class DiaryOwnershipGuard implements CanActivate {
  constructor(
    private readonly diaryService: DiaryService,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request<{ diary_id: string }>>();
    const response = context
      .switchToHttp()
      .getResponse<ResLocals.FirebaseAuthenticatedRequest>();

    const user_id = response.locals.user_id;
    const diary_id = request.params.diary_id;

    const diary = await this.diaryService.findOne(diary_id).catch((_) => {
      throw new NotFoundException(this.i18n.t('entity.resourceNotFound'));
    });

    if (diary.user_id !== user_id) {
      throw new UnauthorizedException(
        this.i18n.t('authorization.dontHaveAccessRight'),
      );
    }

    return true;
  }
}
