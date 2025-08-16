import crypto from 'crypto';

export const TOKEN_BYTES = 32; // 256 bits
export const DEFAULT_EXPIRY_HOURS = Number(process.env.CONFIRMATION_TOKEN_EXPIRY_HOURS || 24);

export function generateConfirmationToken(): string {
  return crypto.randomBytes(TOKEN_BYTES).toString('hex');
}

export function hashToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

export function calcExpiryDate(hours = DEFAULT_EXPIRY_HOURS): Date {
  const d = new Date();
  d.setHours(d.getHours() + hours);
  return d;
}

export function isExpired(expiry?: Date | null): boolean {
  if (!expiry) return true;
  return expiry.getTime() < Date.now();
}

export function verifyToken(raw: string, hashed?: string | null): boolean {
  if (!hashed) return false;
  const h = hashToken(raw);
  return timingSafeEqual(h, hashed);
}

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
