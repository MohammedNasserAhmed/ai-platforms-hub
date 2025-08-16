import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import pinoHttpModule from 'pino-http';
import { logger } from './logger.js';
import { randomUUID } from 'crypto';
import { admin } from './routes/admin.js';
import { platforms } from './routes/platforms.js';
import { analytics } from './routes/analytics.js';
import { subscribers } from './routes/subscribers.js';
import path from 'path';
import fs from 'fs';
// @ts-ignore - multer types may not be installed
import multer from 'multer';
import { authMiddleware } from './auth.js';
// Basic input sanitization middleware (very light)
function sanitizePayload(req, _res, next) {
    if (req.body && typeof req.body === 'object') {
        const walk = (obj) => {
            for (const k of Object.keys(obj)) {
                const v = obj[k];
                if (typeof v === 'string') {
                    // trim and remove control chars
                    obj[k] = v.trim().replace(/[\u0000-\u001F\u007F]/g, '');
                }
                else if (v && typeof v === 'object')
                    walk(v);
            }
        };
        walk(req.body);
    }
    next();
}
export const app = express();
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(sanitizePayload);
// Dynamic CORS: when CORS_ORIGIN provided restrict; otherwise allow all.
const allowedOrigins = (process.env.CORS_ORIGIN?.split(',').map(o => o.trim()).filter(Boolean)) || [];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true); // non-browser / curl
        if (allowedOrigins.length === 0)
            return callback(null, true); // allow all
        if (allowedOrigins.includes(origin) || /localhost:\d+$/.test(origin))
            return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
    }
}));
app.use(morgan('dev'));
// HTTP logging with request IDs
const pinoHttp = pinoHttpModule.default || pinoHttpModule;
app.use(pinoHttp({
    logger,
    genReqId: (req, _res) => req.headers['x-request-id'] || randomUUID(),
    customProps: (req) => ({ requestId: req.id })
}));
// Rate limiting (mainly for public endpoints)
const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
const max = Number(process.env.RATE_LIMIT_MAX || 100);
app.use(rateLimit({ windowMs, max, standardHeaders: true, legacyHeaders: false }));
app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/admin', admin);
app.use('/platforms', platforms);
app.use('/analytics', analytics);
app.use('/subscribers', subscribers);
// File uploads (logo images) - stored locally under /uploads
const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir))
    fs.mkdirSync(uploadDir);
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
        const ts = Date.now();
        const ext = path.extname(file.originalname || '') || '.png';
        cb(null, `logo-${ts}${ext}`);
    }
});
const allowedMime = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml'];
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 }, fileFilter: (_req, file, cb) => {
        if (!allowedMime.includes(file.mimetype))
            return cb(new Error('Unsupported file type'));
        cb(null, true);
    } });
app.post('/upload/logo', authMiddleware(process.env.JWT_SECRET), upload.single('file'), (req, res) => {
    if (!req.file)
        return res.status(400).json({ error: 'No file' });
    const publicUrl = `/uploads/${req.file.filename}`;
    res.json({ url: publicUrl });
});
app.delete('/upload/logo/:name', authMiddleware(process.env.JWT_SECRET), (req, res) => {
    const name = req.params.name;
    if (!/^[a-zA-Z0-9_.-]+$/.test(name))
        return res.status(400).json({ error: 'Invalid name' });
    const filePath = path.join(uploadDir, name);
    if (fs.existsSync(filePath))
        fs.unlinkSync(filePath);
    res.json({ ok: true });
});
app.use('/uploads', express.static(uploadDir));
// Central revalidation trigger endpoint (noop placeholder; integrate with frontend ISR webhook if needed)
app.post('/revalidate', authMiddleware(process.env.JWT_SECRET), (req, res) => {
    // could enqueue paths from req.body.paths
    res.json({ ok: true, paths: req.body?.paths || [] });
});
// Generic error handler (ensures CORS rejections & validation surfaces JSON)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, _req, res, _next) => {
    logger.error({ err }, 'Unhandled error');
    const status = err?.status || (err?.message?.includes('CORS') ? 403 : 500);
    res.status(status).json({ error: err?.message || 'Internal Server Error' });
});
if (process.env.NODE_ENV !== 'test') {
    const port = Number(process.env.PORT || 4000);
    app.listen(port, () => console.log(`Backend listening on :${port}`));
}
export default app;
