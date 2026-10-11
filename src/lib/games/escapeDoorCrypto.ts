import crypto from 'crypto';

function encryptionKey() {
  const secret = process.env.GAME_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error('GAME_SESSION_SECRET must contain at least 32 random characters');
  return crypto.createHash('sha256').update(secret).digest();
}

export interface RoundTokenPayload {
  sessionId: string;
  level: number;
  doorCount: number;
  safeDoorIndex: number;
  timestamp: number;
  nonce: string;
}

export const LEVEL_DOOR_CONFIG: Record<number, number> = {
  1: 2,
  2: 3,
  3: 3,
  4: 4,
  5: 3,
  6: 4,
  7: 5,
  8: 4,
  9: 5,
  10: 6,
};

export const LEVEL_BASE_SCORES: Record<number, number> = {
  1: 100,
  2: 150,
  3: 200,
  4: 300,
  5: 400,
  6: 550,
  7: 700,
  8: 900,
  9: 1100,
  10: 1500,
};

export const LEVEL_BASE_XP: Record<number, number> = {
  1: 20,
  2: 30,
  3: 40,
  4: 50,
  5: 60,
  6: 75,
  7: 90,
  8: 110,
  9: 130,
  10: 150,
};

export function getDoorCountForLevel(level: number): number {
  if (level >= 1 && level <= 10) {
    return LEVEL_DOOR_CONFIG[level] || 3;
  }
  // Endless mode: 4 to 6 doors (Level 13+: 5 to 6 doors)
  if (level >= 13) {
    return crypto.randomInt(5, 7); // 5 or 6
  }
  return crypto.randomInt(4, 7); // 4, 5, or 6
}

export function getDoorMultiplier(doorCount: number): number {
  switch (doorCount) {
    case 2:
      return 1.0;
    case 3:
      return 1.25;
    case 4:
      return 1.5;
    case 5:
      return 1.75;
    case 6:
      return 2.0;
    default:
      return 1.0;
  }
}

export function getStreakMultiplier(streak: number): number {
  if (streak >= 7) return 2.0;
  if (streak >= 5) return 1.5;
  if (streak >= 3) return 1.25;
  return 1.0;
}

export function getBaseScoreForLevel(level: number): number {
  if (level <= 10) {
    return LEVEL_BASE_SCORES[level] || 100;
  }
  return 1500 + (level - 10) * 250;
}

export function getBaseXpForLevel(level: number): number {
  if (level <= 10) {
    return LEVEL_BASE_XP[level] || 20;
  }
  return 150 + (level - 10) * 20;
}

/**
 * Encrypts round state into an opaque tamper-proof token using AES-256-GCM.
 * The client CANNOT read safeDoorIndex before making a selection!
 */
export function encryptRoundToken(payload: RoundTokenPayload): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const jsonStr = JSON.stringify(payload);
  const encrypted = Buffer.concat([cipher.update(jsonStr, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${iv.toString('hex')}.${encrypted.toString('hex')}.${tag.toString('hex')}`;
}

/**
 * Decrypts and verifies the round token.
 */
export function decryptRoundToken(token: string): RoundTokenPayload | null {
  try {
    if (token.length > 4096 || !/^[a-f0-9]{24}\.[a-f0-9]+\.[a-f0-9]{32}$/.test(token)) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [ivHex, encHex, tagHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const enc = Buffer.from(encHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey(), iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(enc), decipher.final()]);
    const parsed: RoundTokenPayload = JSON.parse(decrypted.toString('utf8'));

    // Expire token after 10 minutes
    if (!Number.isFinite(parsed.timestamp) || parsed.timestamp > Date.now() || Date.now() - parsed.timestamp > 10 * 60 * 1000) {
      return null;
    }

    return parsed;
  } catch (err) {
    return null;
  }
}
