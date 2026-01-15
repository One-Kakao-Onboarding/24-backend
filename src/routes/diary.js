import express from 'express';
import { generateDiary, getDiaries, getDiariesByMonth } from '../controllers/diaryController.js';

const router = express.Router();

router.post('/generate', generateDiary);
router.get('/list', getDiaries);
router.get('/month', getDiariesByMonth);

export default router;
