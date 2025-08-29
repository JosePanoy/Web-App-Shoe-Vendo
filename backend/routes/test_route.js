import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Backend is running');
});

router.get('/test', (req, res) => {
  res.send('This is for testing route');
});


export default router;