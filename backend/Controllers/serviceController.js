import Transaction from '../models/transaction.js';

// Resolve cycle durations from env with safe defaults
const toPosInt = (v, fb) => {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : fb;
};
const STANDARD_DURATION_SEC = toPosInt(process.env.STANDARD_DURATION_SEC, 180);
const DEEP_DURATION_SEC = toPosInt(process.env.DEEP_DURATION_SEC, 300);

export const requestService = async (req, res) => {
  const { serviceType, studentId } = req.body;
  try {
    const amount = serviceType === 'deep' ? 20 : 10;
    const durationSec = serviceType === 'deep' ? DEEP_DURATION_SEC : STANDARD_DURATION_SEC;
    const expectedCompleteAt = new Date(Date.now() + durationSec * 1000);

    const tx = new Transaction({
      studentId,
      serviceType,
      amount,
      durationSec,
      expectedCompleteAt
    });
    await tx.save();
    res.json({ message: 'Service started', transaction: tx });
  } catch (err) {
    console.error("❌ Request service error:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStatus = async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.id);
    if (!tx) return res.status(404).json({ message: 'Transaction not found' });
    res.json(tx);
  } catch (err) {
    console.error("❌ Get status error:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const completeService = async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.id);
    if (!tx) return res.status(404).json({ message: 'Transaction not found' });
    tx.status = 'completed';
    await tx.save();
    res.json({ message: 'Service completed', transaction: tx });
  } catch (err) {
    console.error("❌ Complete service error:", err);
    res.status(500).json({ message: 'Server error' });
  }
};
