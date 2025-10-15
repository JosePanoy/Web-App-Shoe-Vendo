import express from 'express';
import { getAdminDashboardSummary } from '../Controllers/AdminDashboardInfoController.js';
import { verifyToken } from '../Middlewares/auth.js';

const router = express.Router();

router.get('/summary', verifyToken, getAdminDashboardSummary);

export default router;
