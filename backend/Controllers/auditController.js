import AuditLog from '../models/auditLog.js';
import EventEmitter from 'events';
import jwt from 'jsonwebtoken';

export const auditBus = new EventEmitter();

export const recordAudit = async (req, payload = {}) => {
  try {
    const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').toString();
    const userAgent = (req.headers['user-agent'] || '').toString();
    const doc = new AuditLog({ ...payload, ip, userAgent });
    await doc.save();
    try {
      auditBus.emit('new', doc.toObject());
    } catch {}
  } catch (err) {
    // Silently ignore audit failures to avoid breaking primary flow
    console.error('Audit record error:', err?.message || err);
  }
};

export const listAudit = async (req, res) => {
  // Admin only: ensure role checked by middleware upstream
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 20);
    const before = req.query.before || null; // cursor _id for older items
    const since = req.query.since || null; // ISO date for newer-than polling
    const action = req.query.action || null;
    const actorRole = req.query.actorRole || null;

    const filter = {};
    if (action) filter.action = action;
    if (actorRole) filter.actorRole = actorRole;

    if (since) {
      // Return items strictly newer than provided timestamp
      const sinceDate = new Date(since);
      if (!isNaN(sinceDate.getTime())) {
        filter.createdAt = { $gt: sinceDate };
      }
      const items = await AuditLog.find(filter).sort({ createdAt: 1, _id: 1 }).limit(limit).lean();
      return res.json({ items, nextCursor: null });
    }

    if (before) {
      filter._id = { $lt: before };
    }

    const items = await AuditLog.find(filter)
      .sort({ _id: -1 })
      .limit(limit)
      .lean();

    const nextCursor = items.length === limit ? items[items.length - 1]._id : null;
    return res.json({ items, nextCursor });
  } catch (err) {
    console.error('List audit error:', err);
    res.status(500).json({ message: 'Unable to load audit logs.' });
  }
};

export const streamAudit = (req, res) => {
  try {
    // Accept token in Authorization header (Bearer) or query param for SSE
    const authHeader = req.headers['authorization'];
    const queryToken = req.query.token;
    const token = (() => {
      if (authHeader) {
        const parts = authHeader.trim().split(' ');
        return parts.length === 2 ? parts[1] : parts[0];
      }
      return queryToken;
    })();
    if (!token) return res.status(401).end();
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'webappvendo2025');
    if (!decoded || decoded.role !== 'admin') return res.status(403).end();

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const heartbeat = setInterval(() => {
      res.write(`: ping\n\n`);
    }, 15000);

    const handler = (payload) => {
      try {
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
      } catch {}
    };
    auditBus.on('new', handler);

    req.on('close', () => {
      clearInterval(heartbeat);
      auditBus.off('new', handler);
    });
  } catch (err) {
    console.error('SSE auth error:', err?.message || err);
    res.status(401).end();
  }
};
