'use client';
import { signInAnonymously } from 'firebase/auth';
import { getFirebaseAuth } from './firebase';
let signingIn: Promise<unknown> | undefined;

export async function authenticatedFetch(input: string, init: RequestInit = {}) {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Authentication is unavailable.');
  await auth.authStateReady();
  if (!auth.currentUser) {
    signingIn ??= signInAnonymously(auth).finally(() => { signingIn = undefined; });
    await signingIn;
  }
  const user = auth.currentUser;
  if (!user) throw new Error('Sign in to continue.');
  const { useAppStore } = await import('@/store/useAppStore');
  const local = useAppStore.getState().user;
  if (local.id !== user.uid || local.uid !== user.uid) {
    useAppStore.setState({ user: { ...local, id: user.uid, uid: user.uid } });
  }
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${await user.getIdToken()}`);
  return fetch(input, { ...init, headers });
}
