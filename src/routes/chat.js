import express from 'express';
import { sendMessage, getMessages, getRecentChats } from '../controllers/chatController.js';

const router = express.Router();

router.post('/send', sendMessage);
router.get('/messages', getMessages);
router.get('/recent', getRecentChats);

export default router;
