import bcrypt from 'bcryptjs';
import Admin from '../models/admin.js';
import { recordAudit } from './auditController.js';

export const getMe = async (req, res) => {
  try {
    const id = req.user?.id;
    if (!id) return res.status(401).json({ message: 'Unauthorized' });
    const admin = await Admin.findById(id).lean();
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    res.json({ fname: admin.fname, lname: admin.lname, email: admin.email, pincode: admin.pincode, role: admin.role });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateMe = async (req, res) => {
  try {
    const id = req.user?.id;
    if (!id) return res.status(401).json({ message: 'Unauthorized' });
    const { fname, lname, email, currentPassword, newPassword } = req.body || {};
    const admin = await Admin.findById(id);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    if (typeof fname === 'string') admin.fname = fname.trim();
    if (typeof lname === 'string') admin.lname = lname.trim();
    if (typeof email === 'string') admin.email = email.trim();

    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ message: 'Current password required.' });
      const ok = await bcrypt.compare(currentPassword, admin.password);
      if (!ok) return res.status(400).json({ message: 'Current password incorrect.' });
      admin.password = await bcrypt.hash(newPassword, 10);
    }

    await admin.save();
    try { await recordAudit(req, { actorId: String(id), actorRole: 'admin', actorName: `${admin.fname} ${admin.lname}`.trim(), action: 'ADMIN_PROFILE_UPDATE' }); } catch {}
    res.json({ message: 'Profile updated', fname: admin.fname, lname: admin.lname, email: admin.email });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { fname, lname, email, pincode, password } = req.body || {};
    if (!fname || !lname || !email || !pincode || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const exists = await Admin.findOne({ $or: [{ email }, { pincode }] });
    if (exists) return res.status(409).json({ message: 'Admin with same email or pincode exists.' });
    const hashed = await bcrypt.hash(password, 10);
    const admin = new Admin({ fname, lname, email, pincode, password: hashed, role: 'admin' });
    await admin.save();
    try { await recordAudit(req, { actorId: String(req.user?.id || ''), actorRole: 'admin', action: 'ADMIN_CREATE', details: { newAdmin: { email, pincode } } }); } catch {}
    res.status(201).json({ message: 'Admin created', admin: { id: admin._id, fname, lname, email, pincode } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

