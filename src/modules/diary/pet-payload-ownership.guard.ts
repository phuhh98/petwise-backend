import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from 'src/generated/i18n.generated';
import { ResLocals } from 'src/interfaces/express.interface';

import { PetService } from '../pet/pet.service';

/**
 * Route guard to validate user ownership of pet based on pet_id in request body
 * Use on single pet access endpoints
 * Required to include FirebaseAuthenticationGuard before to let user_id available in response.locals
 */
@Injectable()
export class PetPayloadOwnershipGuard implements CanActivate {
  constructor(
    private readonly petService: PetService,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request<object, { pet_id: string }>>();
    const response = context
      .switchToHttp()
      .getResponse<ResLocals.FirebaseAuthenticatedRequest>();

    const user_id = response.locals.user_id;
    const pet_id = request.body.pet_id;

    if (!pet_id) {
      throw new BadRequestException();
    }

    const pet = await this.petService.findOne(pet_id).catch((_) => {
      throw new NotFoundException(
        this.i18n.t('entity.resourceNotFoundTemplate', {
          args: {
            resource: 'Pet',
            resource_id: pet_id,
          },
        }),
      );
    });

    if (pet.user_id !== user_id) {
      throw new BadRequestException(
        this.i18n.t('entity.resourceNotFoundTemplate', {
          args: {
            resource: 'Pet',
          },
        }),
      );
    }

    return true;
  }
}
