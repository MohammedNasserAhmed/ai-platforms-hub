import { Router } from 'express';
import { prisma } from '../utils/prisma.js';
import { signJwt, authMiddleware } from '../auth.js';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
export const admin = Router();
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });
admin.post('/login', validate({ body: loginSchema }), async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.adminUser.findUnique({ where: { email } });
    if (!user)
        return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok)
        return res.status(401).json({ error: 'Invalid credentials' });
    const token = signJwt({ sub: user.id, email: user.email }, process.env.JWT_SECRET);
    res.json({ token });
});
admin.get('/me', authMiddleware(process.env.JWT_SECRET), async (req, res) => {
    const user = req.user;
    res.json({ ok: true, user });
});
