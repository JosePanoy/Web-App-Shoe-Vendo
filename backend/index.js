// index.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import basicRoutes from './routes/test_route.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// for middleware
app.use(cors());
app.use(express.json());

// db connection dont touch
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('WebApp-Shoe_Vendo Database Connected'))
  .catch((err) => console.error('MongoDB connection error:', err));


app.use('/', basicRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is: ${PORT}`);
});
