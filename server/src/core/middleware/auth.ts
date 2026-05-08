import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { User } from '../auth/user.model.js';

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Missing token' });
  try {
    const payload = jwt.verify(token, env.jwtSecret) as { sub?: string; role?: string; tokenVersion?: number };
    const user = await User.findById(payload.sub).select('name email role status isActive deletedAt tokenVersion branchId');
    if (!user || !user.isActive || user.deletedAt || user.status === 'lock') {
      return res.status(401).json({ message: 'Account is locked or inactive' });
    }
    if (Number(payload.tokenVersion ?? 0) !== Number(user.tokenVersion ?? 0)) {
      return res.status(401).json({ message: 'Session expired' });
    }
    (req as any).user = {
      sub: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
      branchId: user.branchId,
      tokenVersion: user.tokenVersion,
    };
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

export function requireOwner(req: Request, res: Response, next: NextFunction) {
  if ((req as any).user?.role !== 'owner') {
    return res.status(403).json({ message: 'Owner permission required' });
  }
  next();
}
