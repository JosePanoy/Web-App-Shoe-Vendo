//insertUser.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/users.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/WebApp-Shoes_Vendo';

const insertUser = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected');

    const hashedPassword = await bcrypt.hash('pass123', 10);

    const user = new User({
      fname: 'Aiah',
      lname: 'Arceta',
      contactNum: '09123456780',
      address: 'Manila, Philippines',
      pincode: 111111,
      email: 'aiah@example.com',
      password: hashedPassword
    });

    await user.save();
    console.log('User inserted successfully');
    mongoose.disconnect();
  } catch (err) {
    console.error(err);
    mongoose.disconnect();
  }
};

insertUser();
