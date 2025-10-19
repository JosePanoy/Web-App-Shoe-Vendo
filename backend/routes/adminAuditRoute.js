import express from 'express';
import { listAudit, streamAudit } from '../controllers/auditController.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

// Admin-only guard
router.get('/', verifyToken, (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required.' });
  }
  return next();
}, listAudit);

export default router;

// SSE stream for real-time audit updates
router.get('/stream', streamAudit);
