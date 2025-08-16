import jwt from 'jsonwebtoken';
export function signJwt(payload, secret, expiresIn = '7d') {
    const opts = { expiresIn };
    return jwt.sign(payload, secret, opts);
}
export function authMiddleware(secret) {
    return (req, res, next) => {
        const header = req.headers.authorization;
        if (!header?.startsWith('Bearer '))
            return res.status(401).json({ error: 'Unauthorized' });
        const token = header.slice(7);
        try {
            const decoded = jwt.verify(token, secret);
            req.user = decoded;
            next();
        }
        catch {
            return res.status(401).json({ error: 'Unauthorized' });
        }
    };
}
