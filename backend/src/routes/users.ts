import { Router } from 'express';
import {
  getCurrentUser,
  updateCurrentUser,
  getDriverMetrics,
  registerUser,
} from '../controllers/userController';
import { authenticateTelegram } from '../middleware/auth';

const router = Router();

// Register route - doesn't require existing user, but requires valid initData
router.post('/register', async (req, res, next) => {
  // Validate initData but don't require existing user
  const initData = req.headers['x-telegram-init-data'] as string;
  
  if (!initData) {
    // For development, allow bypassing auth
    if (process.env.NODE_ENV === 'development' && req.headers['x-dev-user-id']) {
      return registerUser(req, res, next);
    }
    return res.status(401).json({ error: { message: 'Telegram initData required' } });
  }
  
  // Call registerUser which will validate initData
  return registerUser(req, res, next);
});

// All other routes require authentication
router.use(authenticateTelegram);

router.get('/me', getCurrentUser);
router.patch('/me', updateCurrentUser);
router.get('/drivers/:id/metrics', getDriverMetrics);

export default router;
