import express from 'express';
import { getMachineStatus, streamMachine } from '../controllers/machineController.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

router.get('/status', verifyToken, getMachineStatus);
// SSE uses token via query param; verification is handled inside the controller
router.get('/stream', streamMachine);

export default router;
