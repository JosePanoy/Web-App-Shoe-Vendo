//insertAdmin.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Admin from './models/admin.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/WebApp-Shoes_Vendo';

const insertAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected');

    const hashedPassword = await bcrypt.hash('pass123', 10);

    const admin = new Admin({
      fname: 'Jose',
      lname: 'Rizal',
      contactNum: '09123456789',
      address: 'Calamba, Laguna',
      pincode: 111111,
      email: 'phhero@example.com',
      password: hashedPassword
    });

    await admin.save();
    console.log('Admin inserted successfully');
    mongoose.disconnect();
  } catch (err) {
    console.error(err);
    mongoose.disconnect();
  }
};

insertAdmin();
