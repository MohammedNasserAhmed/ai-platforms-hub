import { Router } from 'express';
import { prisma } from '../utils/prisma.js';
import dayjs from 'dayjs';

export const analytics = Router();

analytics.post('/visit', async (req, res) => {
  const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
  const ua = req.headers['user-agent'] || 'unknown';
  await prisma.visitor.create({ data: { ip, ua } });
  res.json({ ok: true });
});

analytics.post('/click/:platformId', async (req, res) => {
  const platformId = Number(req.params.platformId);
  await prisma.click.create({ data: { platformId } });
  const count = await prisma.click.count({ where: { platformId } });
  res.json({ platformId, count });
});

analytics.get('/summary', async (_req, res) => {
  const totalVisitors = await prisma.visitor.count();
  const clicks = await prisma.click.groupBy({ by: ['platformId'], _count: { platformId: true } });
  const byDay = await prisma.$queryRawUnsafe<Array<{ day: string; clicks: number }>>(
    `select to_char("createdAt", 'YYYY-MM-DD') as day, count(*)::int as clicks from "Click" group by 1 order by 1`
  );
  res.json({ totalVisitors, clicks, byDay });
});
