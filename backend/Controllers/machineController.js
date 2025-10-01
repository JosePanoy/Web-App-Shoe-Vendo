import Machine from '../models/machine.js';

export const getMachineStatus = async (req, res) => {
  try {
    const status = await Machine.findOne().sort({ createdAt: -1 });
    res.json(status || { status: 'standby' });
  } catch (err) {
    console.error("❌ Get machine status error:", err);
    res.status(500).json({ message: 'Server error' });
  }
};
