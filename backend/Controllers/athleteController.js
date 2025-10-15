import bcrypt from 'bcryptjs';
import Athlete from '../Models/athlete.js';

const sanitizeAthlete = athlete => ({
  idNumber: athlete.idNumber,
  fname: athlete.fname,
  lname: athlete.lname,
  firstLogin: athlete.firstLogin,
  role: athlete.role,
  createdAt: athlete.createdAt,
  updatedAt: athlete.updatedAt
});

const MAX_PIN_RESETS = 3;

const SECURITY_PROMPTS = {
  fullName: 'What is your registered full name?',
  firstName: 'What is your given first name?',
  lastName: 'What is your family / last name?',
  favoriteLunchFood: 'What is your go-to lunch food before practice?',
  extraAnswer: 'What is your additional recovery answer?'
};

const normalizeAnswer = value =>
  (value || '')
    .toString()
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();

const securityAnswersComplete = answers => {
  if (!answers) return false;
  const required = [
    'fullName',
    'firstName',
    'lastName',
    'favoriteLunchFood',
    'extraAnswer'
  ];
  return !required.some(field => !answers[field] || !answers[field].trim());
};

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

export const initiateForgotPin = async (req, res) => {
  const trimmedId = (req.body?.idNumber || '').toString().trim();

  if (!/^\d{6}$/.test(trimmedId)) {
    return res
      .status(400)
      .json({ message: 'Please enter a valid 6-digit athlete ID.' });
  }

  try {
    const athlete = await Athlete.findOne({ idNumber: trimmedId });
    if (!athlete) {
      return res.status(404).json({
        message:
          'We could not find this athlete ID. Check for typos or contact the athletic office.'
      });
    }

    const resetCount = athlete.pinResetCount || 0;
    if (athlete.pinResetBlocked || resetCount >= MAX_PIN_RESETS) {
      if (!athlete.pinResetBlocked) {
        athlete.pinResetBlocked = true;
        await athlete.save();
      }
      return res.status(423).json({
        message:
          'This athlete ID has reached the maximum number of self-service PIN resets. Please visit the athletic office for assistance.',
        blocked: true
      });
    }

    if (!securityAnswersComplete(athlete.securityAnswers)) {
      return res.status(400).json({
        message:
          'Recovery questions were not set up for this account. Please contact the athletic office to reset your PIN.'
      });
    }

    const questionList = [
      { key: 'fullName', prompt: SECURITY_PROMPTS.fullName },
      { key: 'firstName', prompt: SECURITY_PROMPTS.firstName },
      { key: 'lastName', prompt: SECURITY_PROMPTS.lastName },
      {
        key: 'favoriteLunchFood',
        prompt: SECURITY_PROMPTS.favoriteLunchFood
      },
      {
        key: 'extraAnswer',
        prompt:
          athlete.securityAnswers.extraQuestionLabel ||
          SECURITY_PROMPTS.extraAnswer
      }
    ];

    return res.json({
      message: 'Answer your recovery questions to verify your identity.',
      questions: questionList,
      remainingResets: Math.max(0, MAX_PIN_RESETS - resetCount)
    });
  } catch (err) {
    console.error('Forgot PIN initiate error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const resetForgotPin = async (req, res) => {
  const {
    idNumber,
    answers = {},
    newPincode,
    confirmPincode
  } = req.body || {};

  const trimmedId = (idNumber || '').toString().trim();
  const trimmedNew = (newPincode || '').toString().trim();
  const trimmedConfirm = (confirmPincode || '').toString().trim();

  if (!/^\d{6}$/.test(trimmedId)) {
    return res
      .status(400)
      .json({ message: 'Please enter a valid 6-digit athlete ID.' });
  }

  if (!/^\d{4}$/.test(trimmedNew) || !/^\d{4}$/.test(trimmedConfirm)) {
    return res
      .status(400)
      .json({ message: 'New pincode entries must be 4 digits long.' });
  }

  if (trimmedNew !== trimmedConfirm) {
    return res
      .status(400)
      .json({ message: 'New pincode and confirmation do not match.' });
  }

  try {
    const athlete = await Athlete.findOne({ idNumber: trimmedId });
    if (!athlete) {
      return res.status(404).json({
        message:
          'We could not find this athlete ID. Check for typos or contact the athletic office.'
      });
    }

    const resetCount = athlete.pinResetCount || 0;
    if (athlete.pinResetBlocked || resetCount >= MAX_PIN_RESETS) {
      if (!athlete.pinResetBlocked) {
        athlete.pinResetBlocked = true;
        await athlete.save();
      }
      return res.status(423).json({
        message:
          'This athlete ID has reached the maximum number of self-service PIN resets. Please visit the athletic office for assistance.',
        blocked: true
      });
    }

    if (!securityAnswersComplete(athlete.securityAnswers)) {
      return res.status(400).json({
        message:
          'Recovery questions were not set up for this account. Please contact the athletic office to reset your PIN.'
      });
    }

    const stored = athlete.securityAnswers;
    const requiredFields = [
      'fullName',
      'firstName',
      'lastName',
      'favoriteLunchFood',
      'extraAnswer'
    ];
    const mismatchedField = requiredFields.find(
      field =>
        normalizeAnswer(stored[field]) !== normalizeAnswer(answers[field])
    );

    if (mismatchedField) {
      return res.status(400).json({
        message:
          'One or more recovery answers do not match our records. Please review your responses.'
      });
    }

    const hashed = await bcrypt.hash(trimmedNew, 10);
    athlete.pincode = hashed;
    athlete.firstLogin = false;
    athlete.pinResetCount = resetCount + 1;
    athlete.pinResetLastAt = new Date();

    if (athlete.pinResetCount >= MAX_PIN_RESETS) {
      athlete.pinResetBlocked = true;
    }

    await athlete.save();

    const remaining = Math.max(0, MAX_PIN_RESETS - athlete.pinResetCount);
    const message =
      remaining > 0
        ? `Pincode reset successfully. You have ${remaining} reset${
            remaining === 1 ? '' : 's'
          } remaining.`
        : 'Pincode reset successfully. No additional self-service resets remain for this ID.';

    return res.json({
      message,
      remainingResets: remaining,
      blocked: athlete.pinResetBlocked
    });
  } catch (err) {
    console.error('Forgot PIN reset error:', err);
    return res.status(500).json({ message: 'Server error' });
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
