import mongoose from 'mongoose';

const machineSchema = new mongoose.Schema({
  status: { type: String, enum: ['standby', 'in-use', 'error'], default: 'standby' },
  lastService: { type: Date },
  errors: [String]
}, { timestamps: true });

const Machine = mongoose.models.Machine || mongoose.model('Machine', machineSchema);
export default Machine;
