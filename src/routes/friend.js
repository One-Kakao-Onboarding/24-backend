import express from 'express';
import { getFriends, getFriendById } from '../controllers/friendController.js';

const router = express.Router();

router.get('/list', getFriends);
router.get('/:friendId', getFriendById);

export default router;
