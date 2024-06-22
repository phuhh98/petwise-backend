import { IsString } from 'class-validator';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Firebase use Timestamp class under the hood
 * This interface will give us a way to type check the return value get from Firebase
 * before parse it to string in return
 */
export interface IBaseEntity {
  created_at: Timestamp | string;

  id: string;

  updated_at: Timestamp | string;
}

export class BaseEntity implements IBaseEntity {
  @IsString()
  created_at: string;

  @IsString()
  id: string;

  @IsString()
  updated_at: string;
}
