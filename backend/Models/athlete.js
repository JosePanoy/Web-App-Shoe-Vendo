import mongoose from 'mongoose';

const athleteSchema = new mongoose.Schema({
  idNumber: { type: String, required: true, unique: true },
  fname: { type: String, required: true },
  lname: { type: String, required: true },
  pincode: { type: String, required: true }, // hashed
  firstLogin: { type: Boolean, default: true },
  role: { type: String, default: 'user' }
}, { timestamps: true });

const Athlete = mongoose.models.Athlete || mongoose.model('Athlete', athleteSchema);
export default Athlete;
