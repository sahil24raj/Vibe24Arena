import 'server-only';
import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function adminApp() {
  const existing = getApps().find(app => app.name === 'arena-server');
  if (existing) return existing;
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) throw new Error('Server Firebase project is not configured');
  const credentials = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  return initializeApp({ projectId, credential: credentials ? cert(JSON.parse(credentials)) : applicationDefault() }, 'arena-server');
}
export const adminAuth = () => getAuth(adminApp());
export const adminDb = () => getFirestore(adminApp());
