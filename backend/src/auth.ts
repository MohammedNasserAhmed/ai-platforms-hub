import jwt, { SignOptions } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export function signJwt(payload: object, secret: string, expiresIn: SignOptions['expiresIn'] = '7d') {
  const opts: SignOptions = { expiresIn };
  return jwt.sign(payload as any, secret as any, opts);
}

export function authMiddleware(secret: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
    const token = header.slice(7);
    try {
      const decoded = jwt.verify(token, secret);
      (req as any).user = decoded;
      next();
    } catch {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  };
}
