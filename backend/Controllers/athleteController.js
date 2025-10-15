import bcrypt from 'bcryptjs';
import Athlete from '../Models/athlete.js';

const sanitizeAthlete = (athlete) => ({
  idNumber: athlete.idNumber,
  fname: athlete.fname,
  lname: athlete.lname,
  firstLogin: athlete.firstLogin,
  role: athlete.role,
  createdAt: athlete.createdAt,
  updatedAt: athlete.updatedAt
});

export const registerAthlete = async (req, res) => {
  const { idNumber, fname, lname } = req.body || {};
  const trimmedIdNumber = (idNumber || '').toString().trim();

  if (!/^\d{6}$/.test(trimmedIdNumber)) {
    return res.status(400).json({ message: 'ID number must be a 6-digit code.' });
  }

  try {
    const existing = await Athlete.findOne({ idNumber: trimmedIdNumber });
    if (existing) {
      return res.status(409).json({ message: 'Athlete is already registered.' });
    }

    const normalizedFname = (fname || '').toString().trim();
    const normalizedLname = (lname || '').toString().trim();
    const athlete = new Athlete({
      idNumber: trimmedIdNumber,
      fname: normalizedFname,
      lname: normalizedLname
    });

    await athlete.save();

    res.status(201).json({
      message: 'Athlete registered successfully. They must create a pincode on first login.',
      athlete: sanitizeAthlete(athlete)
    });
  } catch (err) {
    console.error('Register athlete error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const listAthletes = async (req, res) => {
  try {
    const athletes = await Athlete.find().sort({ createdAt: -1 });
    res.json(athletes.map(sanitizeAthlete));
  } catch (err) {
    console.error('Fetch athletes error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const completeAthleteOnboarding = async (req, res) => {
  const {
    idNumber,
    pincode,
    confirmPincode,
    securityAnswers = {},
    firstName,
    lastName
  } = req.body || {};

  const trimmedId = (idNumber || '').toString().trim();
  const trimmedPin = (pincode || '').toString().trim();
  const trimmedConfirm = (confirmPincode || '').toString().trim();

  if (!/^\d{6}$/.test(trimmedId)) {
    return res.status(400).json({ message: 'ID number must be a 6-digit code.' });
  }

  if (!/^\d{4}$/.test(trimmedPin)) {
    return res.status(400).json({ message: 'Pincode must be a 4-digit code.' });
  }

  if (trimmedPin !== trimmedConfirm) {
    return res.status(400).json({ message: 'Pincode confirmation does not match.' });
  }

  try {
    const athlete = await Athlete.findOne({ idNumber: trimmedId });
    if (!athlete) {
      return res.status(404).json({ message: 'Athlete record not found. Please contact an administrator.' });
    }

    if (!athlete.firstLogin) {
      return res.status(400).json({ message: 'Athlete already completed onboarding.' });
    }

    const hashedPin = await bcrypt.hash(trimmedPin, 10);
    athlete.pincode = hashedPin;
    athlete.firstLogin = false;
    athlete.fname = (firstName || '').toString().trim() || athlete.fname;
    athlete.lname = (lastName || '').toString().trim() || athlete.lname;

    athlete.securityAnswers = {
      fullName: (securityAnswers.fullName || '').toString().trim(),
      firstName: (securityAnswers.firstName || '').toString().trim(),
      lastName: (securityAnswers.lastName || '').toString().trim(),
      favoriteLunchFood: (securityAnswers.favoriteLunchFood || '').toString().trim(),
      extraAnswer: (securityAnswers.extraAnswer || '').toString().trim(),
      extraQuestionLabel: (securityAnswers.extraQuestionLabel || '').toString().trim()
    };

    await athlete.save();

    res.json({
      message: 'Athlete onboarding completed successfully. You may now log in with your new pincode.',
      athlete: sanitizeAthlete(athlete)
    });
  } catch (err) {
    console.error('Athlete onboarding error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteAthlete = async (req, res) => {
  const { idNumber } = req.params;
  const trimmedIdNumber = (idNumber || '').toString().trim();

  if (!trimmedIdNumber) {
    return res.status(400).json({ message: 'ID number is required.' });
  }

  try {
    const removed = await Athlete.findOneAndDelete({ idNumber: trimmedIdNumber });
    if (!removed) {
      return res.status(404).json({ message: 'Athlete not found.' });
    }

    res.json({ message: 'Athlete removed successfully.' });
  } catch (err) {
    console.error('Delete athlete error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
