import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma.js';
import { validate } from '../middleware/validate.js';
import { createEmailProvider, confirmationEmailTemplate } from '../utils/email.js';
import { generateConfirmationToken, hashToken, calcExpiryDate } from '../utils/tokens.js';
import rateLimit from 'express-rate-limit';

export const subscribe = Router();

const provider = createEmailProvider();

const bodySchema = z.object({ email: z.string().email() });

const limiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false });
subscribe.use(limiter);

subscribe.post('/', validate({ body: bodySchema }), async (req, res) => {
  const { email } = req.body as any;
  try {
    const rawToken = generateConfirmationToken();
    const hashed = hashToken(rawToken);
    const expiry = calcExpiryDate();
    const existing = await prisma.subscriber.findUnique({ where: { email } });
    if (!existing) {
      await prisma.subscriber.create({ data: { email, confirmationToken: hashed, tokenExpiry: expiry } });
    } else if (!existing.confirmed) {
      await prisma.subscriber.update({ where: { email }, data: { confirmationToken: hashed, tokenExpiry: expiry } });
    }
    // Build confirmation link (through frontend path)
    const base = process.env.FRONTEND_BASE_URL || 'http://localhost:3000';
    const link = `${base}/confirm?token=${rawToken}&email=${encodeURIComponent(email)}`;
    if (provider) {
      const { html, text, subject } = confirmationEmailTemplate(link);
      await provider.sendEmail({ to: email, subject, html, text });
    }
    // Always respond generic (avoid enumeration)
    res.json({ ok: true, message: 'If that email is not confirmed yet, a confirmation link will arrive shortly.' });
  } catch (e: any) {
    res.status(500).json({ error: 'Failed to process subscription' });
  }
});
