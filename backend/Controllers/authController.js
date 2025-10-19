import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Athlete from '../Models/athlete.js';
import { recordAudit } from './auditController.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

export const loginAthlete = async (req, res) => {
  const { idNumber, pincode } = req.body || {};

  const trimmedId = (idNumber || '').toString().trim();
  const trimmedPin = (pincode || '').toString().trim();

  if (!/^\d{6}$/.test(trimmedId) || !/^\d{4}$/.test(trimmedPin)) {
    return res.status(400).json({ message: 'Invalid credentials format.' });
  }

  try {
    const athlete = await Athlete.findOne({ idNumber: trimmedId });
    if (!athlete) {
      return res.status(404).json({ message: 'Athlete account not found. Please contact an administrator.' });
    }

    if (!athlete.pincode) {
      return res.status(400).json({ message: 'Account not yet activated. Complete onboarding first.' });
    }

    const isMatch = await bcrypt.compare(trimmedPin, athlete.pincode);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect ID number or pincode.' });
    }

    const token = jwt.sign({ id: athlete._id, role: 'athlete', idNumber: athlete.idNumber }, JWT_SECRET, {
      expiresIn: '2h'
    });

    res.json({
      token,
      role: 'athlete',
      fname: athlete.fname,
      lname: athlete.lname,
      idNumber: athlete.idNumber,
      firstLogin: athlete.firstLogin
    });
    try {
      await recordAudit(req, {
        actorId: String(athlete._id || ''),
        actorRole: 'athlete',
        actorName: `${athlete.fname || ''} ${athlete.lname || ''}`.trim(),
        action: 'ATHLETE LOGIN',
        details: { route: '/api/auth/athlete/login' }
      });
    } catch {}
  } catch (err) {
    console.error('Athlete login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const logoutAthlete = async (req, res) => {
  try {
    const user = req.user || {};
    await recordAudit(req, {
      actorId: String(user.id || ''),
      actorRole: 'athlete',
      actorName: user.idNumber ? `ID ${user.idNumber}` : '',
      action: 'ATHLETE LOGOUT'
    });
  } catch {}
  return res.json({ message: 'Logout successful.' });
};

export const changePincode = async (req, res) => {
  const { idNumber, oldPincode, newPincode } = req.body || {};

  const trimmedId = (idNumber || '').toString().trim();
  const trimmedOld = (oldPincode || '').toString().trim();
  const trimmedNew = (newPincode || '').toString().trim();

  if (!/^\d{6}$/.test(trimmedId)) {
    return res.status(400).json({ message: 'ID number must be a 6-digit code.' });
  }

  if (!/^\d{4}$/.test(trimmedOld) || !/^\d{4}$/.test(trimmedNew)) {
    return res.status(400).json({ message: 'Pincodes must be 4-digit codes.' });
  }

  try {
    const athlete = await Athlete.findOne({ idNumber: trimmedId });
    if (!athlete) return res.status(404).json({ message: 'Athlete not found.' });

    const isMatch = await bcrypt.compare(trimmedOld, athlete.pincode || '');
    if (!isMatch) return res.status(400).json({ message: 'Old pincode incorrect.' });

    const hashed = await bcrypt.hash(trimmedNew, 10);
    athlete.pincode = hashed;
    athlete.firstLogin = false;
    await athlete.save();

    res.json({ message: 'Pincode updated successfully.' });
  } catch (err) {
    console.error('Change pincode error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
