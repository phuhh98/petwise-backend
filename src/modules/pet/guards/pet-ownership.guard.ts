import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { I18nService } from 'nestjs-i18n';
import { PetService } from 'src/common/services/pet.service';
import { I18nTranslations } from 'src/generated/i18n.generated';
import { ResLocals } from 'src/interfaces/express.interface';

/**
 * Route guard to validate user ownership of pet based on :pet_id in request route param
 * Use on single pet access endpoints
 * Required to include FirebaseAuthenticationGuard before to let user_id available in response.locals
 */
@Injectable()
export class PetOwnershipGuard implements CanActivate {
  constructor(
    private readonly petService: PetService,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request<{ pet_id: string }>>();
    const response = context
      .switchToHttp()
      .getResponse<ResLocals.FirebaseAuthenticatedRequest>();

    const user_id = response.locals.user_id;
    const pet_id = request.params.pet_id;

    const pet = await this.petService.findOne(pet_id).catch((_) => {
      throw new NotFoundException(this.i18n.t('entity.resourceNotFound'));
    });

    if (pet.user_id !== user_id) {
      throw new UnauthorizedException(
        this.i18n.t('authorization.dontHaveAccessRight'),
      );
    }

    return true;
  }
}
