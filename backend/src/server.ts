import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './config/database';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import washroomRoutes from './routes/washrooms';
import reviewRoutes from './routes/reviews';
import friendsRoutes from './routes/friends';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/washrooms', washroomRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/friends', friendsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await pool.end();
  process.exit(0);
});
