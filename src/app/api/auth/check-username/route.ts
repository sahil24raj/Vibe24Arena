import { api, ApiError, identity, rateLimit } from '@/lib/server/api';
import { adminDb } from '@/lib/server/firebaseAdmin';
export async function GET(req: Request) {
  return api(async () => {
    const auth = await identity(req);
    await rateLimit(auth.uid, 'username', 60);
    const username = new URL(req.url).searchParams.get('username')?.trim().toLowerCase() || '';
    if (!/^[a-z0-9_]{3,20}$/.test(username)) throw new ApiError(400, 'Username must be 3–20 letters, digits or underscores.');
    const uid = auth.uid;
    const existing = await adminDb().collection('users').where('usernameLower', '==', username).limit(2).get();
    return { available: existing.empty || existing.docs.every(d => d.id === uid) };
  });
}
