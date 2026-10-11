import 'server-only';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminAuth, adminDb } from './firebaseAdmin';

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export async function identity(req: Request) {
  const match = /^Bearer ([^\s]+)$/.exec(req.headers.get('authorization') || '');
  if (!match || match[1].length > 8192) throw new ApiError(401, 'Sign in to continue.');
  const auth = adminAuth();
  try { return await auth.verifyIdToken(match[1], true); }
  catch { throw new ApiError(401, 'Your sign-in has expired. Please sign in again.'); }
}
export async function readJson<T>(req: Request, schema: z.ZodType<T>, maxBytes = 32_768): Promise<T> {
  if (!req.headers.get('content-type')?.includes('application/json')) throw new ApiError(415, 'Expected JSON.');
  const reader = req.body?.getReader();
  if (!reader) throw new ApiError(400, 'Request body is required.');
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) { await reader.cancel(); throw new ApiError(413, 'Request is too large.'); }
    chunks.push(value);
  }
  try { return schema.parse(JSON.parse(Buffer.concat(chunks).toString('utf8'))); }
  catch { throw new ApiError(400, 'Invalid request payload.'); }
}
// Shared, atomic limits work across server instances. Enable TTL on expiresAt.
export async function rateLimit(uid: string, scope: string, limit = 120) {
  const ref = adminDb().collection('rateLimits').doc(`${uid}_${scope}`);
  const now = Date.now();
  await adminDb().runTransaction(async tx => {
    const data = (await tx.get(ref)).data();
    const fresh = !data || data.resetAt <= now;
    const count = fresh ? 0 : data.count;
    if (count >= limit) throw new ApiError(429, 'Too many requests. Try again shortly.');
    tx.set(ref, { count: count + 1, resetAt: fresh ? now + 60_000 : data!.resetAt, expiresAt: new Date(now + 120_000) });
  });
}
export async function api(run: () => Promise<unknown>) {
  try { return NextResponse.json(await run(), { headers: { 'Cache-Control': 'no-store' } }); }
  catch (error) {
    const known = error instanceof ApiError;
    if (!known) console.error('API operation failed', error instanceof Error ? error.name : 'UnknownError');
    return NextResponse.json({ success: false, error: known ? error.message : 'Service temporarily unavailable.' }, { status: known ? error.status : 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
