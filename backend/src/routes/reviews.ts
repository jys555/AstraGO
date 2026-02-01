import { Router } from 'express';
import {
  createReviewHandler,
  getDriverReviewsHandler,
  getReviewByReservationHandler,
} from '../controllers/reviewController';
import { authenticateTelegram } from '../middleware/auth';

const router = Router();

router.use(authenticateTelegram);

router.post('/', createReviewHandler);
router.get('/driver/:driverId', getDriverReviewsHandler);
router.get('/reservation/:reservationId', getReviewByReservationHandler);

export default router;
