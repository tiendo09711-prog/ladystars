import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { Types } from 'mongoose';
import { User } from '../auth/user.model.js';
import { writeAuditLog } from '../audit/audit.service.js';
import { AuditLog } from '../audit/audit.model.js';
import { SalePayment, ProductRefund } from '../../modules/product/product.models.js';
import { ExpensePayment, Receipt } from '../../modules/accounting/accounting.models.js';

const router = Router();

const StaffInput = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  phone: z.string().optional().or(z.literal('')),
  status: z.enum(['open', 'lock']).default('open'),
});

const StaffUpdateInput = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional().or(z.literal('')),
  status: z.enum(['open', 'lock']).optional(),
});

const ResetPasswordInput = z.object({ password: z.string().min(6) });

function publicUser(user: any) {
  return {
    id: user.id,
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    lastLoginAt: user.lastLoginAt,
    lockedAt: user.lockedAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function ensureEmailAvailable(email: string, ignoreId?: string) {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing && existing.id !== ignoreId) {
    const error = new Error('Email already exists');
    (error as any).status = 409;
    throw error;
  }
}

function dateRange(query: any) {
  const filter: Record<string, unknown> = {};
  const createdAt: Record<string, Date> = {};
  if (query.from) createdAt.$gte = new Date(String(query.from));
  if (query.to) {
    const end = new Date(String(query.to));
    end.setHours(23, 59, 59, 999);
    createdAt.$lte = end;
  }
  if (Object.keys(createdAt).length) filter.createdAt = createdAt;
  return filter;
}

router.get('/', async (_req, res) => {
  const items = await User.find({ role: 'staff', deletedAt: { $exists: false } }).sort({ createdAt: -1 });
  res.json({ items: items.map(publicUser), total: items.length });
});

router.post('/', async (req, res) => {
  const input = StaffInput.extend({ password: z.string().min(6) }).parse(req.body);
  await ensureEmailAvailable(input.email);
  const staff = await User.create({
    name: input.name,
    email: input.email,
    phone: input.phone,
    role: 'staff',
    status: input.status,
    passwordHash: await bcrypt.hash(input.password, 10),
    createdBy: (req as any).user?.sub,
    isActive: true,
    lockedAt: input.status === 'lock' ? new Date() : undefined,
  });
  await writeAuditLog(req, {
    action: 'staff.create',
    module: 'staff',
    resource: 'User',
    resourceId: staff.id,
    after: publicUser(staff),
  });
  res.status(201).json(publicUser(staff));
});

router.patch('/:id', async (req, res) => {
  const input = StaffUpdateInput.parse(req.body);
  const staff = await User.findOne({ _id: req.params.id, role: 'staff', deletedAt: { $exists: false } });
  if (!staff) return res.status(404).json({ message: 'Staff not found' });
  if (input.email) await ensureEmailAvailable(input.email, staff.id);
  const before = publicUser(staff);
  if (input.name !== undefined) staff.name = input.name;
  if (input.email !== undefined) staff.email = input.email;
  if (input.phone !== undefined) staff.phone = input.phone;
  if (input.status !== undefined && input.status !== staff.status) {
    staff.status = input.status;
    staff.lockedAt = input.status === 'lock' ? new Date() : undefined;
    staff.tokenVersion = Number(staff.tokenVersion ?? 0) + 1;
  }
  await staff.save();
  await writeAuditLog(req, {
    action: 'staff.update',
    module: 'staff',
    resource: 'User',
    resourceId: staff.id,
    before,
    after: publicUser(staff),
  });
  res.json(publicUser(staff));
});

router.patch('/:id/lock', async (req, res) => {
  const staff = await User.findOne({ _id: req.params.id, role: 'staff', deletedAt: { $exists: false } });
  if (!staff) return res.status(404).json({ message: 'Staff not found' });
  const before = publicUser(staff);
  staff.status = 'lock';
  staff.lockedAt = new Date();
  staff.tokenVersion = Number(staff.tokenVersion ?? 0) + 1;
  await staff.save();
  await writeAuditLog(req, { action: 'staff.lock', module: 'staff', resource: 'User', resourceId: staff.id, before, after: publicUser(staff) });
  res.json(publicUser(staff));
});

router.patch('/:id/open', async (req, res) => {
  const staff = await User.findOne({ _id: req.params.id, role: 'staff', deletedAt: { $exists: false } });
  if (!staff) return res.status(404).json({ message: 'Staff not found' });
  const before = publicUser(staff);
  staff.status = 'open';
  staff.lockedAt = undefined;
  staff.tokenVersion = Number(staff.tokenVersion ?? 0) + 1;
  await staff.save();
  await writeAuditLog(req, { action: 'staff.open', module: 'staff', resource: 'User', resourceId: staff.id, before, after: publicUser(staff) });
  res.json(publicUser(staff));
});

router.delete('/:id', async (req, res) => {
  const staff = await User.findOne({ _id: req.params.id, role: 'staff', deletedAt: { $exists: false } });
  if (!staff) return res.status(404).json({ message: 'Staff not found' });
  if (staff.status !== 'lock') return res.status(422).json({ message: 'Only locked staff accounts can be deleted' });
  const before = publicUser(staff);
  staff.deletedAt = new Date();
  staff.isActive = false;
  staff.tokenVersion = Number(staff.tokenVersion ?? 0) + 1;
  await staff.save();
  await writeAuditLog(req, { action: 'staff.delete_soft', module: 'staff', resource: 'User', resourceId: staff.id, before });
  res.status(204).send();
});

router.post('/:id/reset-password', async (req, res) => {
  const input = ResetPasswordInput.parse(req.body);
  const staff = await User.findOne({ _id: req.params.id, role: 'staff', deletedAt: { $exists: false } });
  if (!staff) return res.status(404).json({ message: 'Staff not found' });
  staff.passwordHash = await bcrypt.hash(input.password, 10);
  staff.tokenVersion = Number(staff.tokenVersion ?? 0) + 1;
  await staff.save();
  await writeAuditLog(req, { action: 'staff.reset_password', module: 'staff', resource: 'User', resourceId: staff.id, metadata: { targetEmail: staff.email } });
  res.json({ ok: true });
});

router.get('/:id/stats', async (req, res) => {
  const staff = await User.findOne({ _id: req.params.id, role: 'staff' });
  if (!staff) return res.status(404).json({ message: 'Staff not found' });
  const userId = new Types.ObjectId(staff.id);
  const range = dateRange(req.query);
  const userFilter = {
    ...range,
    $or: [{ userId }, { authorId: userId }, { userCreatedId: userId }, { createdBy: userId }],
  };

  const [sales, refunds, receipts, expenses] = await Promise.all([
    SalePayment.find(userFilter),
    ProductRefund.find(userFilter),
    Receipt.find(userFilter),
    ExpensePayment.find(userFilter),
  ]);

  const revenue = sales.reduce((sum, item) => sum + Number(item.value ?? 0), 0);
  const paid = sales.reduce((sum, item) => sum + Number(item.valuePayment ?? 0), 0);
  const refundValue = refunds.reduce((sum, item) => sum + Number(item.value ?? 0), 0);

  res.json({
    staff: publicUser(staff),
    summary: {
      salesCount: sales.length,
      refundCount: refunds.length,
      revenue,
      paid,
      debt: revenue - paid,
      refundValue,
      receiptsValue: receipts.reduce((sum, item) => sum + Number(item.value ?? 0), 0),
      expensesValue: expenses.reduce((sum, item) => sum + Number(item.value ?? 0), 0),
    },
    recentSales: sales.slice(0, 20),
    recentRefunds: refunds.slice(0, 20),
  });
});

router.get('/:id/activity', async (req, res) => {
  const staff = await User.findOne({ _id: req.params.id, role: 'staff' });
  if (!staff) return res.status(404).json({ message: 'Staff not found' });
  const range = dateRange(req.query);
  const items = await AuditLog.find({ ...range, userId: staff._id }).sort({ createdAt: -1 }).limit(100);
  res.json({ items, total: items.length });
});

export default router;
