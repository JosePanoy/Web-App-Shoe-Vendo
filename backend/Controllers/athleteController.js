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
