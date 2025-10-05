import mongoose from 'mongoose';

// 'errors' is a reserved schema pathname in Mongoose and can trigger warnings.
// Rename the field to 'errorLogs' to avoid the warning while preserving intent.
const machineSchema = new mongoose.Schema({
  status: { type: String, enum: ['standby', 'in-use', 'error'], default: 'standby' },
  lastService: { type: Date },
  errorLogs: { type: [String], default: [] }
}, { timestamps: true });

// For backward compatibility, provide a virtual named 'errors' that maps to 'errorLogs'.
machineSchema.virtual('errors')
  .get(function() {
    return this.errorLogs;
  })
  .set(function(v) {
    this.errorLogs = v;
  });

const Machine = mongoose.models.Machine || mongoose.model('Machine', machineSchema);
export default Machine;
