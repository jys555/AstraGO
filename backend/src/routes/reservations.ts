import { Router } from 'express';
import {
  createReservationHandler,
  getReservationHandler,
  confirmReservationHandler,
  cancelReservationHandler,
  getActiveReservationHandler,
} from '../controllers/reservationController';
import { authenticateTelegram } from '../middleware/auth';
import { createReservationSchema } from '../utils/validators';
import { z } from 'zod';

const router = Router();

function validate(schema: z.ZodSchema) {
  return (req: any, res: any, next: any) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: {
            message: 'Validation error',
            details: error.errors,
          },
        });
      }
      next(error);
    }
  };
}

router.use(authenticateTelegram);

router.post('/', validate(createReservationSchema), createReservationHandler);
router.get('/active', getActiveReservationHandler);
router.get('/:id', getReservationHandler);
router.patch('/:id/confirm', confirmReservationHandler);
router.delete('/:id', cancelReservationHandler);

export default router;
