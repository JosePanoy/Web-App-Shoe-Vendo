import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  fname: { type: String, required: true },
  lname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  pincode: { type: String, required: true }, // hashed
  role: { type: String, default: 'admin' }
}, { timestamps: true });

const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
export default Admin;
