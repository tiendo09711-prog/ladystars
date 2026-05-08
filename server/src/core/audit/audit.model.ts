import { Schema, model } from 'mongoose';

export const AuditLog = model('AuditLog', new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  userEmail: String,
  action: { type: String, required: true },
  module: { type: String, required: true },
  resource: String,
  resourceId: String,
  before: Schema.Types.Mixed,
  after: Schema.Types.Mixed,
  metadata: Schema.Types.Mixed,
  ip: String,
  userAgent: String,
}, { timestamps: true }));

AuditLog.schema.index({ userId: 1, createdAt: -1 });
AuditLog.schema.index({ module: 1, action: 1, createdAt: -1 });
