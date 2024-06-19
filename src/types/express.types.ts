import { Response } from 'express';

export namespace ResLocals {
  export interface FirebaseAuthenticatedRequest
    extends Response<
      {},
      {
        /**
         * Firebase user id
         */
        user_id: string;
      }
    > {}
}
