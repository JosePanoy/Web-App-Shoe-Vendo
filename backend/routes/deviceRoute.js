import express from 'express';
import { recordCleaningEvent } from '../controllers/deviceController.js';

const router = express.Router();

router.post('/cleaning-event', recordCleaningEvent);
router.post('/cleaning-start', recordCleaningEvent);

export default router;
