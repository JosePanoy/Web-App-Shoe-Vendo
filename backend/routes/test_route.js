import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Backend is running ✅');
});

router.get('/test', (req, res) => {
  res.send('Test route working');
});

export default router;
