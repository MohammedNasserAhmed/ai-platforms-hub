import { Router } from 'express';
import { prisma } from '../utils/prisma.js';
import { authMiddleware } from '../auth.js';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { createEmailProvider, confirmationEmailTemplate } from '../utils/email.js';
import { generateConfirmationToken, hashToken, calcExpiryDate } from '../utils/tokens.js';
import { toCSV } from '../utils/csv.js';

export const adminSubscribers = Router();
adminSubscribers.use(authMiddleware(process.env.JWT_SECRET!));

const provider = createEmailProvider();

adminSubscribers.get('/', async (_req, res)=> {
  const items = await prisma.subscriber.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(items);
});

adminSubscribers.get('/stats', async (_req,res)=>{
  const [total, confirmed, pending] = await Promise.all([
    prisma.subscriber.count(),
    prisma.subscriber.count({ where: { confirmed: true } as any }),
    prisma.subscriber.count({ where: { confirmed: false } as any })
  ]);
  res.json({ total, confirmed, pending, confirmationRate: total ? confirmed/total : 0 });
});

adminSubscribers.get('/export', async (_req,res)=>{
  const rows: any[] = await prisma.subscriber.findMany({ orderBy: { createdAt: 'desc' } });
  const csv = toCSV(rows.map(r=>({ id: r.id, email: r.email, confirmed: r.confirmed, createdAt: r.createdAt.toISOString() })));
  res.setHeader('Content-Type','text/csv');
  res.setHeader('Content-Disposition','attachment; filename="subscribers.csv"');
  res.send(csv);
});

adminSubscribers.post('/:id/resend', validate({ params: z.object({ id: z.coerce.number().int().positive() }) }), async (req,res)=>{
  const id = Number(req.params.id);
  const sub: any = await prisma.subscriber.findUnique({ where: { id } });
  if(!sub) return res.status(404).json({ error: 'Not found' });
  if(sub.confirmed) return res.status(400).json({ error: 'Already confirmed' });
  const raw = generateConfirmationToken();
  const hashed = hashToken(raw);
  const expiry = calcExpiryDate();
  await prisma.subscriber.update({ where: { id }, data: { confirmationToken: hashed, tokenExpiry: expiry } as any });
  if (provider) {
    const base = process.env.FRONTEND_BASE_URL || 'http://localhost:3000';
    const link = `${base}/confirm?token=${raw}&email=${encodeURIComponent(sub.email)}`;
    const { html, text, subject } = confirmationEmailTemplate(link);
    await provider.sendEmail({ to: sub.email, subject, html, text });
  }
  res.json({ ok: true });
});

adminSubscribers.delete('/:id', validate({ params: z.object({ id: z.coerce.number().int().positive() }) }), async (req,res)=>{
  const id = Number(req.params.id);
  await prisma.subscriber.delete({ where: { id } });
  res.json({ ok: true });
});
