import { Timestamp } from 'firebase-admin/firestore';

/**
 * Type guards for Firestore timestampt
 * @param value
 * @returns
 */
export function isTimeStamp(value: any): value is Timestamp {
  return value instanceof Timestamp;
}
