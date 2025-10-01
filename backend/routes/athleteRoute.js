import express from 'express';
import { registerAthlete, listAthletes } from '../controllers/athleteController.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', verifyToken, registerAthlete); // Admin only
router.get('/', verifyToken, listAthletes);

export default router;
