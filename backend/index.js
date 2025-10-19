import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import basicRoutes from './routes/test_route.js';
import authRoutes from './routes/authRoute.js';
import athleteRoutes from './routes/athleteRoute.js';
import serviceRoutes from './routes/serviceRoute.js';
import machineRoutes from './routes/machineRoute.js';
import adminDashboardRoutes from './routes/adminDashRoute.js';
import adminAuditRoutes from './routes/adminAuditRoute.js';
import adminStatsRoutes from './routes/adminStatsRoute.js';
import adminAccountRoutes from './routes/adminAccountRoute.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// DB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/WebApp-Shoes_Vendo';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/', basicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/athletes', athleteRoutes);
app.use('/api/service', serviceRoutes);
app.use('/api/machine', machineRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/admin/audit', adminAuditRoutes);
app.use('/api/admin/stats', adminStatsRoutes);
app.use('/api/admin', adminAccountRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
