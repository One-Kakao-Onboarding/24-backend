import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

export const corsOptions = {
  origin: [frontendUrl, 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

export const corsMiddleware = cors(corsOptions);
