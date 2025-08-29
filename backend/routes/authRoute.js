import express from 'express';
import { login } from '../Controllers/login.js';
import { verifyToken } from '../Middlewares/auth.js';



const router = express.Router();

// Login route
router.post('/login', login);

// Admin dashboard route (protected)
router.get('/admin-dashboard', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
  res.send('Welcome to Admin Dashboard');
});

export default router; // <- THIS LINE fixes your error
