import { Router } from 'express';
import { prisma } from '../utils/prisma.js';
import { z } from 'zod';
import { toCSV } from '../utils/csv.js';
import { authMiddleware } from '../auth.js';
import { validate } from '../middleware/validate.js';

export const subscribers = Router();

const subSchema = z.object({ email: z.string().email() });
subscribers.post('/', validate({ body: subSchema }), async (req, res) => {
  const { email } = req.body as any;
  await prisma.subscriber.upsert({ where: { email }, create: { email }, update: {} });
  res.json({ ok: true });
});

subscribers.get('/export', authMiddleware(process.env.JWT_SECRET!), async (_req, res) => {
  const rows = await prisma.subscriber.findMany({ orderBy: { createdAt: 'desc' } });
  const csv = toCSV(rows.map((r: any) => ({ id: r.id, email: r.email, createdAt: r.createdAt.toISOString() })));
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="subscribers.csv"');
  res.send(csv);
});

