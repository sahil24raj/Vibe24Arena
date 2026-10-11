import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
test('Firestore denies anonymous access, cross-account reads, and all direct writes', async () => {
  const env = await initializeTestEnvironment({ projectId: 'demo-security', firestore: { rules: readFileSync('firestore.rules', 'utf8') } });
  try {
    await env.withSecurityRulesDisabled(async ctx => { await setDoc(doc(ctx.firestore(), 'users/alice'), { email: 'private@example.invalid', coins: 0 }); });
    const alice = env.authenticatedContext('alice').firestore();
    const bob = env.authenticatedContext('bob').firestore();
    const anon = env.unauthenticatedContext().firestore();
    await assertSucceeds(getDoc(doc(alice, 'users/alice')));
    await assertFails(getDoc(doc(bob, 'users/alice')));
    await assertFails(getDoc(doc(anon, 'users/alice')));
    await assertFails(getDocs(collection(alice, 'users')));
    for (const path of ['users/alice', 'leaderboards/score', 'rooms/ABCDEF', 'gameSessions/session', 'rateLimits/alice', 'usernames/alice']) {
      await assertFails(setDoc(doc(alice, path), { coins: 999999 }));
      if (path !== 'users/alice') await assertFails(getDoc(doc(alice, path)));
    }
  } finally { await env.cleanup(); }
});
test('verified rankings are publicly readable but cannot be forged by clients', async () => {
  const env = await initializeTestEnvironment({ projectId: 'demo-security', firestore: { rules: readFileSync('firestore.rules', 'utf8') } });
  try {
    await env.withSecurityRulesDisabled(async ctx => { await setDoc(doc(ctx.firestore(), 'verifiedLeaderboards/alice_game'), { wins: 1, username: 'Alice' }); });
    await assertSucceeds(getDoc(doc(env.unauthenticatedContext().firestore(), 'verifiedLeaderboards/alice_game')));
    await assertFails(setDoc(doc(env.authenticatedContext('alice').firestore(), 'verifiedLeaderboards/alice_game'), { wins: 999999 }));
  } finally { await env.cleanup(); }
});
