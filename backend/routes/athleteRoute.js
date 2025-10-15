import express from 'express';
import {
  registerAthlete,
  listAthletes,
  deleteAthlete,
  completeAthleteOnboarding,
  initiateForgotPin,
  resetForgotPin
} from '../Controllers/athleteController.js';
import { verifyToken } from '../Middlewares/auth.js';

const router = express.Router();

router.post('/register', verifyToken, registerAthlete); // Admin only
router.get('/', verifyToken, listAthletes);
router.delete('/:idNumber', verifyToken, deleteAthlete);
router.post('/onboard', completeAthleteOnboarding);
router.post('/forgot-pin/start', initiateForgotPin);
router.post('/forgot-pin/reset', resetForgotPin);

export default router;
