import Machine from '../models/machine.js';
import Transaction from '../models/transaction.js';
import jwt from 'jsonwebtoken';

export const getMachineStatus = async (_req, res) => {
  try {
    const doc = await Machine.findOne().sort({ createdAt: -1 });
    const payload = doc ? doc.toObject() : { status: 'standby' };
    const statusText = payload.status || 'standby';
    const mapped = {
      status: statusText,
      operation: statusText === 'in-use' ? 'Cleaning' : statusText === 'error' ? 'Error' : 'Idle',
      temperature: typeof payload.temperature === 'number' ? payload.temperature : null,
      humidity: typeof payload.humidity === 'number' ? payload.humidity : null,
      lastMaintenance: payload.lastService || null,
      updatedAt: payload.updatedAt || null
    };
    // Attach timing info from the most recent in-progress transaction (if any)
    if (statusText === 'in-use') {
      const tx = await Transaction.findOne({ status: 'in-progress' }).sort({ createdAt: -1 });
      if (tx?.expectedCompleteAt instanceof Date) {
        const now = Date.now();
        const remainingMs = tx.expectedCompleteAt.getTime() - now;
        mapped.expectedCompleteAt = tx.expectedCompleteAt;
        mapped.remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));
      } else {
        mapped.expectedCompleteAt = null;
        mapped.remainingSec = null;
      }
    }
    res.json(mapped);
  } catch (err) {
    console.error('Get machine status error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const streamMachine = async (req, res) => {
  try {
    // Accept auth via Authorization header or token query (SSE can't set headers in some cases)
    let token = null;
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      const parts = authHeader.trim().split(' ');
      token = parts.length === 2 ? parts[1] : parts[0];
    }
    if (!token && req.query?.token) token = req.query.token;
    if (token) {
      try { jwt.verify(token, process.env.JWT_SECRET || 'webappvendo2025'); } catch { return res.status(401).end(); }
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const send = async () => {
      try {
        const doc = await Machine.findOne().sort({ createdAt: -1 });
        const payload = doc ? doc.toObject() : { status: 'standby' };
        const statusText = payload.status || 'standby';
        const mapped = {
          status: statusText,
          operation: statusText === 'in-use' ? 'Cleaning' : statusText === 'error' ? 'Error' : 'Idle',
          temperature: typeof payload.temperature === 'number' ? payload.temperature : null,
          humidity: typeof payload.humidity === 'number' ? payload.humidity : null,
          lastMaintenance: payload.lastService || null,
          updatedAt: payload.updatedAt || new Date()
        };
        if (statusText === 'in-use') {
          const tx = await Transaction.findOne({ status: 'in-progress' }).sort({ createdAt: -1 });
          if (tx?.expectedCompleteAt instanceof Date) {
            const now = Date.now();
            const remainingMs = tx.expectedCompleteAt.getTime() - now;
            mapped.expectedCompleteAt = tx.expectedCompleteAt;
            mapped.remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));
          } else {
            mapped.expectedCompleteAt = null;
            mapped.remainingSec = null;
          }
        }
        res.write(`data: ${JSON.stringify(mapped)}\n\n`);
      } catch {}
    };

    const interval = setInterval(send, 5000);
    await send();
    const heartbeat = setInterval(() => res.write(`: ping\n\n`), 15000);

    req.on('close', () => {
      clearInterval(interval);
      clearInterval(heartbeat);
    });
  } catch (err) {
    console.error('machine stream error:', err?.message || err);
    res.status(500).end();
  }
};
