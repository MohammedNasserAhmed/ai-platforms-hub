import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma.js';
import { verifyToken, isExpired, hashToken } from '../utils/tokens.js';

export const confirm = Router();

const querySchema = z.object({ token: z.string().min(10), email: z.string().email() });

confirm.get('/', async (req, res) => {
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid link' });
  const { token, email } = parsed.data;
  const sub: any = await prisma.subscriber.findUnique({ where: { email } });
  if (!sub) return res.status(400).json({ error: 'Invalid link' });
  if (sub.confirmed) return res.json({ ok: true, status: 'already-confirmed' });
  if (isExpired(sub.tokenExpiry)) return res.status(400).json({ error: 'Token expired', status: 'expired' });
  const valid = verifyToken(token, sub.confirmationToken || hashToken('invalid'));
  if (!valid) return res.status(400).json({ error: 'Invalid token', status: 'invalid' });
  await prisma.subscriber.update({ where: { email }, data: { confirmed: true, confirmedAt: new Date(), confirmationToken: null, tokenExpiry: null } });
  res.json({ ok: true, status: 'confirmed' });
});
