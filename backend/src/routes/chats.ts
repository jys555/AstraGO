import { Router } from 'express';
import {
  getMyChats,
  getChatMessages,
  sendMessage,
  getChatByReservation,
  getChatById,
} from '../controllers/chatController';
import { authenticateTelegram } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

router.use(authenticateTelegram);

// Get all chats for current user
router.get('/', getMyChats);

// Get chat by ID
router.get('/:chatId', getChatById);

// Get chat by reservation ID
router.get('/reservation/:reservationId', getChatByReservation);

// Get messages for a chat
router.get('/:chatId/messages', getChatMessages);

// Send a message
router.post('/:chatId/messages', sendMessage);

export default router;
