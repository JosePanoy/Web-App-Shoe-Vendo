import express from 'express';
import { usageStats } from '../controllers/adminStatsController.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

router.get('/usage', verifyToken, (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required.' });
  return next();
}, usageStats);

export default router;

