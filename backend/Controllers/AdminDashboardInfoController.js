import Athlete from '../Models/athlete.js';

export const getAdminDashboardSummary = async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required.' });
  }

  try {
    const registeredAthletes = await Athlete.countDocuments();

    res.json({
      registeredAthletes
    });
  } catch (err) {
    console.error('Admin dashboard summary error:', err);
    res.status(500).json({ message: 'Unable to fetch dashboard info.' });
  }
};
