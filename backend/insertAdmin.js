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
      fname: 'Christiano',
      lname: 'Ronaldo',
      contactNum: '09123456789',
      address: 'Portugal, Spain',
      pincode: 111111,
      email: 'r7@gmail.com',
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
