import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  fname: { type: String, required: true },
  lname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  pincode: { type: String, required: true },
  password: { type: String, required: true }, // add this
  role: { type: String, default: 'admin' }
}, { timestamps: true });


const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
export default Admin;
