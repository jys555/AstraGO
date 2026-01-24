import { Router } from 'express';
import {
  getCurrentUser,
  updateCurrentUser,
  getDriverMetrics,
} from '../controllers/userController';
import { authenticateTelegram } from '../middleware/auth';

const router = Router();

router.use(authenticateTelegram);

router.get('/me', getCurrentUser);
router.patch('/me', updateCurrentUser);
router.get('/drivers/:id/metrics', getDriverMetrics);

export default router;
