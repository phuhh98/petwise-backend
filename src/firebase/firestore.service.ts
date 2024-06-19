import { Injectable } from '@nestjs/common';
import { getFirestore } from 'firebase-admin/firestore';
import app from './firebase.config';

@Injectable()
export class FirestoreService {
  private db = getFirestore(app);

  getFirestoreCollection(collectionName: string) {
    return this.db.collection(collectionName);
  }
}
