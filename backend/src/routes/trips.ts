import { Router } from 'express';
import {
  getTrips,
  getTripById,
  createTrip,
  updateTrip,
  updateTripSeats,
  getMyTripsAsDriver,
} from '../controllers/tripController';
import { authenticateTelegram } from '../middleware/auth';
import { createTripSchema, updateTripSchema, updateSeatsSchema } from '../utils/validators';
import { z } from 'zod';

const router = Router();

// Validation middleware
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

// Public routes
router.get('/', getTrips);
router.get('/:id', getTripById);

// Protected routes (require authentication)
router.get('/my-trips/driver', authenticateTelegram, getMyTripsAsDriver);
router.post('/', authenticateTelegram, validate(createTripSchema), createTrip);
router.patch('/:id', authenticateTelegram, validate(updateTripSchema), updateTrip);
router.patch('/:id/seats', authenticateTelegram, validate(updateSeatsSchema), updateTripSeats);

export default router;
