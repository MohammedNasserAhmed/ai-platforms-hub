import { Router } from 'express';
import { prisma } from '../utils/prisma.js';
import { authMiddleware } from '../auth.js';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';

export const adminPlatforms = Router();
adminPlatforms.use(authMiddleware(process.env.JWT_SECRET!));

const platformSchema = z.object({ name: z.string().min(2), url: z.string().url(), imageUrl: z.string().url(), description: z.string().min(5), category: z.string().min(2) });

adminPlatforms.get('/', async (_req, res)=> {
  const items = await prisma.platform.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(items);
});

adminPlatforms.get('/:id', validate({ params: z.object({ id: z.coerce.number().int().positive() }) }), async (req,res)=>{
  const id = Number(req.params.id); const p = await prisma.platform.findUnique({ where: { id } });
  if(!p) return res.status(404).json({ error: 'Not found' });
  res.json(p);
});

adminPlatforms.post('/', validate({ body: platformSchema }), async (req,res)=>{
  const data = req.body as any;
  const created = await prisma.platform.create({ data });
  res.status(201).json(created);
});

adminPlatforms.put('/:id', validate({ params: z.object({ id: z.coerce.number().int().positive() }), body: platformSchema }), async (req,res)=>{
  const id = Number(req.params.id);
  const data = req.body as any;
  const updated = await prisma.platform.update({ where: { id }, data });
  res.json(updated);
});

adminPlatforms.delete('/:id', validate({ params: z.object({ id: z.coerce.number().int().positive() }) }), async (req,res)=>{
  const id = Number(req.params.id);
  await prisma.platform.delete({ where: { id } });
  res.json({ ok: true });
});
