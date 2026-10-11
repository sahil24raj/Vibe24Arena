import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Helper to extract config either from a single JSON string or individual environment variables
export const getFirebaseConfig = () => {
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_FIREBASE_CONFIG) {
    try {
      return JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG);
    } catch (e) {
      console.warn('Failed to parse NEXT_PUBLIC_FIREBASE_CONFIG JSON:', e);
    }
  }

  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  };
};

const firebaseConfig = getFirebaseConfig();

export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey !== 'your_api_key_here' &&
    !firebaseConfig.apiKey.includes('Dummy')
  );
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let googleProvider: GoogleAuthProvider | undefined;

export const initFirebase = (): {
  app: FirebaseApp | undefined;
  auth: Auth | undefined;
  db: Firestore | undefined;
  googleProvider: GoogleAuthProvider | undefined;
} => {
  if (!isFirebaseConfigured()) return { app, auth, db, googleProvider };
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }

    if (app && !auth) {
      auth = getAuth(app);
      db = getFirestore(app);
      googleProvider = new GoogleAuthProvider();
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      googleProvider.addScope('email');
      googleProvider.addScope('profile');
    }
  } catch (error) {
    console.warn('Firebase initialization notice:', error);
  }

  return { app, auth, db, googleProvider };
};

// Initialize on load
if (typeof window !== 'undefined' || isFirebaseConfigured()) {
  initFirebase();
}

export const getFirebaseAuth = (): Auth | undefined => {
  if (!auth) initFirebase();
  return auth;
};

export const getFirebaseDb = (): Firestore | undefined => {
  if (!db) initFirebase();
  return db;
};

export const getGoogleProvider = (): GoogleAuthProvider | undefined => {
  if (!googleProvider) initFirebase();
  return googleProvider;
};

export { app, auth, db, googleProvider };

