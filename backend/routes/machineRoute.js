import express from 'express';
import { getMachineStatus } from '../controllers/machineController.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

router.get('/status', verifyToken, getMachineStatus);

export default router;
