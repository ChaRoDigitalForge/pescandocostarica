import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

let firebaseInitialized = false;

const hasFirebaseCredentials = () => {
  return process.env.FIREBASE_PROJECT_ID &&
         process.env.FIREBASE_CLIENT_EMAIL &&
         process.env.FIREBASE_PRIVATE_KEY;
};

if (hasFirebaseCredentials() && !admin.apps.length) {
  try {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    firebaseInitialized = true;
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.warn('⚠️  Firebase initialization failed:', error.message);
    console.warn('⚠️  Running without Firebase authentication');
    firebaseInitialized = false;
  }
} else {
  console.warn('⚠️  Firebase credentials not configured');
  console.warn('⚠️  Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env');
  console.warn('⚠️  Running without Firebase authentication');
}

export const verifyFirebaseToken = async (token) => {
  if (!firebaseInitialized) {
    console.warn('⚠️  Firebase not initialized, skipping token verification');
    return {
      uid: 'dev-user-' + Date.now(),
      email: 'dev@example.com'
    };
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    throw new Error('Invalid Firebase token');
  }
};

export const createFirebaseUser = async (email, password, displayName) => {
  if (!firebaseInitialized) {
    throw new Error('Firebase not initialized. Please configure Firebase credentials.');
  }

  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
    });
    return userRecord;
  } catch (error) {
    throw error;
  }
};

export const isFirebaseEnabled = () => firebaseInitialized;

export default admin;
