import { Router } from 'express';
import { prisma } from '../utils/prisma.js';
import { authMiddleware } from '../auth.js';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
export const platforms = Router();
platforms.get('/', async (req, res) => {
    const { category, q } = req.query;
    const where = {};
    if (category)
        where.category = category;
    if (q)
        where.OR = [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } }
        ];
    const items = await prisma.platform.findMany({
        where,
        orderBy: { createdAt: 'desc' }
    });
    // Aggregate click counts per platform
    const counts = await prisma.click.groupBy({ by: ['platformId'], _count: { platformId: true } });
    const map = Object.fromEntries(counts.map((c) => [c.platformId, c._count.platformId]));
    res.json(items.map((p) => ({ ...p, clickCount: map[p.id] ?? 0 })));
});
// Fetch single platform
platforms.get('/:id', validate({ params: z.object({ id: z.string().regex(/^[0-9]+$/) }) }), async (req, res) => {
    const id = Number(req.params.id);
    const platform = await prisma.platform.findUnique({ where: { id } });
    if (!platform)
        return res.status(404).json({ error: 'Not found' });
    res.json(platform);
});
const platformBody = z.object({
    name: z.string().min(2),
    url: z.string().url(),
    imageUrl: z.string().url(),
    description: z.string().min(5),
    category: z.string().min(2)
});
platforms.post('/', authMiddleware(process.env.JWT_SECRET), validate({ body: platformBody }), async (req, res) => {
    const created = await prisma.platform.create({ data: req.body });
    res.json(created);
});
platforms.put('/:id', authMiddleware(process.env.JWT_SECRET), validate({ params: z.object({ id: z.string().regex(/^\d+$/) }), body: platformBody }), async (req, res) => {
    const id = Number(req.params.id);
    const updated = await prisma.platform.update({ where: { id }, data: req.body });
    res.json(updated);
});
platforms.delete('/:id', authMiddleware(process.env.JWT_SECRET), validate({ params: z.object({ id: z.string().regex(/^\d+$/) }) }), async (req, res) => {
    const id = Number(req.params.id);
    await prisma.platform.delete({ where: { id } });
    res.json({ ok: true });
});
