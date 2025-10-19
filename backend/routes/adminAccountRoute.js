import express from 'express';
import { verifyToken } from '../middlewares/auth.js';
import { getMe, updateMe, createAdmin } from '../controllers/adminAccountController.js';

const router = express.Router();

// All routes admin-only
router.use(verifyToken, (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required.' });
  next();
});

router.get('/me', getMe);
router.put('/me', updateMe);
router.post('/users', createAdmin);

export default router;

