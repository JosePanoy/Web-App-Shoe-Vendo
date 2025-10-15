import Transaction from '../models/transaction.js';

export const requestService = async (req, res) => {
  const { serviceType, studentId } = req.body;
  try {
    const amount = serviceType === 'deep' ? 20 : 10;
    const tx = new Transaction({ studentId, serviceType, amount });
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
