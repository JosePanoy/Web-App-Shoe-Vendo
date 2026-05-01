import AuditLog from '../models/auditLog.js';
import { auditBus } from './auditController.js';

const VALID_RECIPES = new Set(['standard', 'deep']);
const DEFAULT_AMOUNTS = {
  standard: 10,
  deep: 20
};

const getClientMeta = (req) => ({
  ip: (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').toString(),
  userAgent: (req.headers['user-agent'] || '').toString()
});

const isAuthorizedDevice = (req) => {
  const expected = process.env.DEVICE_EVENT_SECRET;
  if (!expected) return true;

  const headerSecret = req.headers['x-device-secret'];
  const authHeader = req.headers.authorization || '';
  const bearerSecret = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  return headerSecret === expected || bearerSecret === expected;
};

export const recordCleaningEvent = async (req, res) => {
  try {
    if (!isAuthorizedDevice(req)) {
      return res.status(401).json({ message: 'Unauthorized device event.' });
    }

    const recipe = String(req.body?.recipe || '').trim().toLowerCase();
    if (!VALID_RECIPES.has(recipe)) {
      return res.status(400).json({ message: 'recipe must be standard or deep.' });
    }

    const machineId = String(req.body?.machineId || req.body?.target || 'SV-01').trim();
    const sessionId = String(req.body?.sessionId || '').trim();
    const event = String(req.body?.event || 'cleaning_started').trim();
    const paymentType = String(req.body?.paymentType || '').trim();
    const rawAmount = Number(req.body?.amount);
    const amount = Number.isFinite(rawAmount) && rawAmount > 0 ? rawAmount : DEFAULT_AMOUNTS[recipe];

    if (sessionId) {
      const existing = await AuditLog.findOne({ sessionId, action: 'CLEAN_START' }).lean();
      if (existing) {
        return res.status(200).json({
          message: 'Cleaning event already recorded.',
          auditLog: existing
        });
      }
    }

    const auditLog = await AuditLog.create({
      actorId: String(req.body?.actorId || '').trim(),
      actorRole: String(req.body?.actorRole || 'machine').trim(),
      actorName: String(req.body?.actorName || machineId).trim(),
      action: 'CLEAN_START',
      sessionId,
      target: machineId,
      recipe,
      amount,
      details: {
        machineId,
        event,
        paymentType,
        status: req.body?.status || 'in-use',
        timestamp: req.body?.timestamp || new Date().toISOString()
      },
      ...getClientMeta(req)
    });

    const payload = auditLog.toObject();
    auditBus.emit('new', payload);

    return res.status(201).json({
      message: 'Cleaning event recorded.',
      auditLog: payload
    });
  } catch (err) {
    console.error('Record cleaning event error:', err);
    return res.status(500).json({ message: 'Unable to record cleaning event.' });
  }
};
