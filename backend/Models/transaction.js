import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Athlete', required: true },
  serviceType: { type: String, enum: ['standard', 'deep'], required: true },
  status: { type: String, enum: ['in-progress', 'completed', 'error'], default: 'in-progress' },
  amount: { type: Number, required: true },
  // Cycle timing
  durationSec: { type: Number, default: 0 },
  expectedCompleteAt: { type: Date, default: null },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
export default Transaction;
