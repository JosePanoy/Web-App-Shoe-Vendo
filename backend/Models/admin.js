import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  fname: { type: String, required: true },
  lname: { type: String, required: true },
  contactNum: { type: String, required: true },
  address: { type: String, required: true },
  pincode: { 
    type: Number, 
    required: true,
    min: 100000,
    max: 999999
  },
  email: { type: String, required: true, unique: true },    
  password: { type: String, required: true }
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);
export default Admin;
