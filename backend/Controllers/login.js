// login.js
import User from '../models/users.js'
import Admin from '../models/admin.js'
import jwt from 'jsonwebtoken'
import { recordAudit } from './auditController.js'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'webappvendo2025';


export const login = async (req, res) => {

  const { pincode, password, role } = req.body || {};
  if (!pincode || !password || !role) {
    return res.status(400).json({ message: 'Missing login fields' });
  }

  try {
    let account
    if (role === 'admin') {
      account = await Admin.findOne({ pincode })
    } else {
      account = await User.findOne({ pincode })
    }

    if (!account) return res.status(404).json({ message: 'User not found' })

    const isMatch = await bcrypt.compare(password, account.password)
    if (!isMatch) return res.status(400).json({ message: 'Invalid password' })

    const token = jwt.sign({ id: account._id, role }, JWT_SECRET, {
      expiresIn: '1h'
    })

    res.json({ token, role, fname: account.fname, lname: account.lname })
    // Audit: admin or user login via /api/auth/login
    try {
      await recordAudit(req, {
        actorId: String(account._id || ''),
        actorRole: role,
        actorName: `${account.fname || ''} ${account.lname || ''}`.trim(),
        action: `${role.toUpperCase()}_LOGIN`,
        details: { route: '/api/auth/login' }
      })
    } catch {}
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

export const logout = async (req, res) => {
  try {
    const u = req.user || {}
    await recordAudit(req, {
      actorId: String(u.id || ''),
      actorRole: (u.role || 'user'),
      actorName: '',
      action: `${(u.role || 'USER').toUpperCase()} LOGOUT`
    })
  } catch {}
  return res.json({ message: 'Logout successful.' })
}
