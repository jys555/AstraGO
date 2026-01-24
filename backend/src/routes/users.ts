import { Router } from 'express';
import {
  getCurrentUser,
  updateCurrentUser,
  registerUser,
  getDriverMetrics,
} from '../controllers/userController';
import { authenticateTelegram } from '../middleware/auth';

const router = Router();

router.get('/me', authenticateTelegram, getCurrentUser);
router.post('/register', registerUser); // Registration endpoint - no auth required, uses initData
router.patch('/me', authenticateTelegram, updateCurrentUser);
router.get('/drivers/:id/metrics', getDriverMetrics);

export default router;
