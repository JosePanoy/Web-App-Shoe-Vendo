//authRoute.js
import express from 'express';
import { login, logout } from '../controllers/login.js';
import { verifyToken } from '../middlewares/auth.js';
import { changePincode, loginAthlete, logoutAthlete } from '../Controllers/authController.js';


const router = express.Router();

// Login route
router.post('/login', login);
router.post('/logout', verifyToken, logout);
router.post('/athlete/login', loginAthlete);
router.post('/athlete/logout', verifyToken, logoutAthlete);

router.post('/change-pincode', changePincode);

// Admin dashboard route (protected)
router.get('/admin-dashboard', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
  res.send('Welcome to Admin Dashboard');
});

export default router; // <- THIS LINE fixes your error
