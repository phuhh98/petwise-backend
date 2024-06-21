import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ResLocals } from 'src/interfaces/express.interface';

import { PetService } from './pet.service';

/**
 * Route guard to validate user ownership of pet base on :pet_id request nvm route param
 * Use on single pet access endpoints
 * Required to include FirebaseAuthenticationGuard before to let user_id available in response.locals
 */
@Injectable()
export class PetOwnershipGuard implements CanActivate {
  constructor(private readonly petService: PetService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request<{ pet_id: string }>>();
    const response = context
      .switchToHttp()
      .getResponse<ResLocals.FirebaseAuthenticatedRequest>();

    const user_id = response.locals.user_id;
    const pet_id = request.params.pet_id;

    const pet = await this.petService.findOne(pet_id).catch((error) => {
      throw new NotFoundException((error as Error).message);
    });

    if (pet.user_id !== user_id) {
      throw new UnauthorizedException('You do not own this pet');
    }

    return true;
  }
}
