import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    actorId: { type: String, default: '' },
    actorRole: { type: String, default: '' },
    actorName: { type: String, default: '' },
    action: { type: String, required: true },
    sessionId: { type: String, default: '' },
    target: { type: String, default: '' },
    recipe: { type: String, default: '' },
    amount: { type: Number, default: 0 },
    details: { type: Object, default: {} },
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' }
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ actorId: 1, createdAt: -1 });

const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;

