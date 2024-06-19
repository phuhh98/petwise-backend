import { Injectable } from '@nestjs/common';
import { CollectionReference, getFirestore } from 'firebase-admin/firestore';
import app from '../../configs/firebase.config';

@Injectable()
export class FirestoreService {
  private db = getFirestore(app);

  getFirestoreCollection<T = unknown>(collectionName: string) {
    return this.db.collection(collectionName) as CollectionReference<T>;
  }

  get fireStore() {
    return this.db;
  }
}
