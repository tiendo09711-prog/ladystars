import type { Request } from 'express';
import { AuditLog } from './audit.model.js';

type AuditInput = {
  action: string;
  module: string;
  resource?: string;
  resourceId?: string;
  before?: unknown;
  after?: unknown;
  metadata?: unknown;
};

function plain(value: unknown) {
  if (!value) return value;
  if (typeof (value as any).toObject === 'function') return (value as any).toObject();
  return value;
}

export async function writeAuditLog(req: Request | undefined, input: AuditInput) {
  try {
    const user = req ? (req as any).user : undefined;
    await AuditLog.create({
      userId: user?.sub,
      userName: user?.name,
      userEmail: user?.email,
      action: input.action,
      module: input.module,
      resource: input.resource,
      resourceId: input.resourceId,
      before: plain(input.before),
      after: plain(input.after),
      metadata: input.metadata,
      ip: req?.ip,
      userAgent: req?.headers['user-agent'],
    });
  } catch (error) {
    console.error('[audit] failed to write log', error);
  }
}
