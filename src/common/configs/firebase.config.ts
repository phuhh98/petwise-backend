import { ServiceAccount, cert, initializeApp } from 'firebase-admin/app';

import firbaseServiceAccount from './firebase.keys.json';

const app = initializeApp({
  credential: cert(firbaseServiceAccount as ServiceAccount),
});

export default app;
