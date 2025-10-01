import bcrypt from 'bcryptjs';
import Athlete from '../models/athlete.js';

export const registerAthlete = async (req, res) => {
  const { idNumber, fname, lname, pincode } = req.body;
  try {
    const hashed = await bcrypt.hash(pincode, 10);
    const athlete = new Athlete({ idNumber, fname, lname, pincode: hashed });
    await athlete.save();
    res.json({ message: 'Athlete registered successfully' });
  } catch (err) {
    console.error("❌ Register athlete error:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const listAthletes = async (req, res) => {
  try {
    const athletes = await Athlete.find().select('-pincode');
    res.json(athletes);
  } catch (err) {
    console.error("❌ Fetch athletes error:", err);
    res.status(500).json({ message: 'Server error' });
  }
};
