import mongoose from 'mongoose';

const athleteSchema = new mongoose.Schema({
  idNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [/^\d{6}$/, 'ID number must be a 6-digit code']
  },
  fname: { type: String, trim: true, default: '' },
  lname: { type: String, trim: true, default: '' },
  pincode: { type: String, default: null },
  firstLogin: { type: Boolean, default: true },
  role: { type: String, default: 'user' }
}, { timestamps: true });

const Athlete = mongoose.models.Athlete || mongoose.model('Athlete', athleteSchema);
export default Athlete;
