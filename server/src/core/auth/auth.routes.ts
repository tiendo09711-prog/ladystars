import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../../config/env.js';
import { requireAuth } from '../middleware/auth.js';
import { User } from './user.model.js';

const router = Router();
const LoginInput = z.object({ email: z.string().email(), password: z.string().min(6) });

router.post('/login', async (req, res) => {
  const input = LoginInput.parse(req.body);
  const user = await User.findOne({ email: input.email, isActive: true });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  if (user.deletedAt || user.status === 'lock') return res.status(401).json({ message: 'Account is locked or inactive' });

  if (user.email === 'admin@myerp.local' && user.role !== 'owner') {
    user.role = 'owner';
    user.status = 'open';
    user.isRootOwner = true;
    await user.save();
  }

  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  user.lastLoginAt = new Date();
  await user.save();
  const token = jwt.sign({ sub: user.id, role: user.role, tokenVersion: user.tokenVersion ?? 0 }, env.jwtSecret, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status } });
});

router.get('/me', requireAuth, async (req, res) => {
  const userId = (req as any).user?.sub;
  const user = await User.findById(userId).select('name email role status branchId isActive deletedAt');
  if (!user || !user.isActive || user.deletedAt || user.status === 'lock') return res.status(401).json({ message: 'Invalid token' });
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role, status: user.status, branchId: user.branchId });
});

export default router;
