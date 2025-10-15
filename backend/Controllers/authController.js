import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Athlete from '../models/athlete.js';
import Admin from "../models/admin.js"

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

export const login = async (req, res) => {
  const { idNumber, pincode, role } = req.body || {};
  if (!idNumber || !pincode || !role) {
    return res.status(400).json({ message: 'Missing login fields' });
  }

  try {
    let account;
    if (role === 'admin') {
      account = await Admin.findOne({ email: idNumber });
    } else {
      account = await Athlete.findOne({ idNumber });
    }

    if (!account) return res.status(404).json({ message: 'Account not found' });

    const isMatch = await bcrypt.compare(pincode, account.pincode);
    if (!isMatch) return res.status(400).json({ message: 'Invalid pincode' });

    const token = jwt.sign({ id: account._id, role }, JWT_SECRET, { expiresIn: '1h' });

    res.json({
      token,
      role,
      fname: account.fname,
      lname: account.lname,
      firstLogin: account.firstLogin
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const changePincode = async (req, res) => {
  const { idNumber, oldPincode, newPincode } = req.body;
  try {
    const user = await Athlete.findOne({ idNumber });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(oldPincode, user.pincode);
    if (!isMatch) return res.status(400).json({ message: 'Old pincode incorrect' });

    const hashed = await bcrypt.hash(newPincode, 10);
    user.pincode = hashed;
    user.firstLogin = false;
    await user.save();

    res.json({ message: 'Pincode updated successfully' });
  } catch (err) {
    console.error("❌ Change pincode error:", err);
    res.status(500).json({ message: 'Server error' });
  }
};
