import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('Missing GEMINI_API_KEY environment variable');
}

export const genAI = new GoogleGenerativeAI(apiKey);

// Gemini model for chat responses
export const chatModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Gemini model with Imagen 3 for image generation
export const imageModel = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash-exp',
});
