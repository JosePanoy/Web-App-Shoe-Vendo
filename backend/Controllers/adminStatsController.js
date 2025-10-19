import AuditLog from '../models/auditLog.js';

const PERIODS = new Set(['day', 'week', 'month', 'year']);

// Prefer explicit timezone for aggregation and labels to avoid UTC drift.
const APP_TZ = process.env.APP_TIMEZONE || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

const startOfPeriod = (period) => {
  const now = new Date();
  // Keep the original rolling windows for continuity, but align other logic via APP_TZ
  if (period === 'day') {
    return new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }
  if (period === 'week') {
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
  if (period === 'month') {
    return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  // year
  return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
};

const genBuckets = (period, start) => {
  const out = [];
  const now = new Date();
  let cursor = new Date(start);
  if (period === 'day') {
    // hourly buckets last 24h
    while (cursor <= now) {
      const label = cursor.toLocaleString('en-US', { hour: 'numeric', hour12: true, timeZone: APP_TZ });
      out.push({ ts: new Date(cursor), label, total: 0, standard: 0, deep: 0 });
      cursor = new Date(cursor.getTime() + 60 * 60 * 1000);
    }
  } else if (period === 'week' || period === 'month') {
    // daily buckets
    while (cursor <= now) {
      const label = cursor.toLocaleString('en-US', { month: 'short', day: 'numeric', timeZone: APP_TZ });
      out.push({ ts: new Date(cursor), label, total: 0, standard: 0, deep: 0 });
      cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
    }
  } else {
    // monthly buckets (12 months)
    while (cursor <= now) {
      const label = cursor.toLocaleString('en-US', { month: 'short', year: 'numeric', timeZone: APP_TZ });
      out.push({ ts: new Date(cursor), label, total: 0, standard: 0, deep: 0 });
      const m = cursor.getMonth();
      const y = cursor.getFullYear();
      cursor = new Date(y, m + 1, 1);
    }
  }
  return out;
};

export const usageStats = async (req, res) => {
  try {
    const period = (req.query.period || 'week').toLowerCase();
    if (!PERIODS.has(period)) return res.status(400).json({ message: 'Invalid period' });
    const start = startOfPeriod(period);

    const match = {
      createdAt: { $gte: start },
      recipe: { $in: ['standard', 'deep'] }
    };

    let groupId;
    if (period === 'day') {
      groupId = {
        y: { $year: { date: '$createdAt', timezone: APP_TZ } },
        m: { $month: { date: '$createdAt', timezone: APP_TZ } },
        d: { $dayOfMonth: { date: '$createdAt', timezone: APP_TZ } },
        h: { $hour: { date: '$createdAt', timezone: APP_TZ } }
      };
    } else if (period === 'year') {
      groupId = {
        y: { $year: { date: '$createdAt', timezone: APP_TZ } },
        m: { $month: { date: '$createdAt', timezone: APP_TZ } }
      };
    } else {
      // week/month -> group by day
      groupId = {
        y: { $year: { date: '$createdAt', timezone: APP_TZ } },
        m: { $month: { date: '$createdAt', timezone: APP_TZ } },
        d: { $dayOfMonth: { date: '$createdAt', timezone: APP_TZ } }
      };
    }

    const docs = await AuditLog.aggregate([
      { $match: match },
      {
        $group: {
          _id: groupId,
          standard: { $sum: { $cond: [{ $eq: ['$recipe', 'standard'] }, 1, 0] } },
          deep: { $sum: { $cond: [{ $eq: ['$recipe', 'deep'] }, 1, 0] } },
          total: { $sum: 1 },
          minTs: { $min: '$createdAt' }
        }
      },
      { $sort: { '_id.y': 1, '_id.m': 1, '_id.d': 1, '_id.h': 1 } }
    ]);

    // Build bucket map
    const buckets = genBuckets(period, start);
    const keyFromId = (id) => {
      if (period === 'day') return `${id.y}-${id.m}-${id.d}-${id.h}`;
      if (period === 'year') return `${id.y}-${id.m}`;
      return `${id.y}-${id.m}-${id.d}`;
    };
    const map = new Map();
    docs.forEach((d) => map.set(keyFromId(d._id), d));

    const totals = { total: 0, standard: 0, deep: 0 };
    const filled = buckets.map((b) => {
      const dt = new Date(b.ts);
      const id =
        period === 'day'
          ? { y: dt.getFullYear(), m: dt.getMonth() + 1, d: dt.getDate(), h: dt.getHours() }
          : period === 'year'
            ? { y: dt.getFullYear(), m: dt.getMonth() + 1 }
            : { y: dt.getFullYear(), m: dt.getMonth() + 1, d: dt.getDate() };
      const found = map.get(keyFromId(id));
      const standard = found?.standard || 0;
      const deep = found?.deep || 0;
      const total = found?.total || 0;
      totals.total += total; totals.standard += standard; totals.deep += deep;
      return { ...b, standard, deep, total };
    });

    res.json({ period, tz: APP_TZ, buckets: filled, totals });
  } catch (err) {
    console.error('usageStats error:', err);
    res.status(500).json({ message: 'Unable to fetch stats' });
  }
};
