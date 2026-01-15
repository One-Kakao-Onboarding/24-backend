import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

export const corsOptions = {
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

export const corsMiddleware = cors(corsOptions);
