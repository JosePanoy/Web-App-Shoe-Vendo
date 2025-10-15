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
  securityAnswers: {
    fullName: { type: String, trim: true, default: '' },
    firstName: { type: String, trim: true, default: '' },
    lastName: { type: String, trim: true, default: '' },
    favoriteLunchFood: { type: String, trim: true, default: '' },
    extraAnswer: { type: String, trim: true, default: '' },
    extraQuestionLabel: { type: String, trim: true, default: '' }
  },
  pinResetCount: { type: Number, default: 0 },
  pinResetBlocked: { type: Boolean, default: false },
  pinResetLastAt: { type: Date, default: null },
  role: { type: String, default: 'athlete' }
}, { timestamps: true });

const Athlete = mongoose.models.Athlete || mongoose.model('Athlete', athleteSchema);
export default Athlete;
