import { Request, Response, NextFunction } from 'express';
import { verifyIdToken } from './firebase';

export async function authGuard(req: Request, res: Response, next: NextFunction) {
  try {
    const h = req.headers.authorization || '';
    const token = h.startsWith('Bearer ') ? h.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'No token' });
    const decoded = await verifyIdToken(token);
    (req as any).uid = decoded.uid;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

export function adminGuard(req: Request, res: Response, next: NextFunction) {
  const uid = (req as any).uid as string | undefined;
  const admins = (process.env.ADMIN_UIDS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (uid && admins.includes(uid)) return next();
  return res.status(403).json({ error: 'Admin only' });
}