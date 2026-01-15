import express from 'express';
import dotenv from 'dotenv';
import { corsMiddleware } from './middleware/cors.js';
import authRoutes from './routes/auth.js';
import friendRoutes from './routes/friend.js';
import chatRoutes from './routes/chat.js';
import diaryRoutes from './routes/diary.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/diary', diaryRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'TalkLog API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`🚀 TalkLog backend server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});
