import express from 'express';
import { requestService, getStatus, completeService } from '../controllers/serviceController.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

router.post('/request', verifyToken, requestService);
router.get('/status/:id', verifyToken, getStatus);
router.post('/complete/:id', verifyToken, completeService);

export default router;
