import express from 'express';
import { registerAthlete, listAthletes, deleteAthlete } from '../Controllers/athleteController.js';
import { verifyToken } from '../Middlewares/auth.js';

const router = express.Router();

router.post('/register', verifyToken, registerAthlete); // Admin only
router.get('/', verifyToken, listAthletes);
router.delete('/:idNumber', verifyToken, deleteAthlete);

export default router;
