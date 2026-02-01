import { Request, Response, NextFunction } from 'express';
import {
  createReview,
  getDriverReviews,
  getReviewByReservation,
} from '../services/reviewService';
import { ValidationError } from '../utils/errors';

export async function createReviewHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user;
    const { reservationId, rating, reason, comment } = req.body;

    if (!reservationId || !rating) {
      throw new ValidationError('Reservation ID and rating are required');
    }

    const review = await createReview(
      reservationId,
      user.id,
      rating,
      reason,
      comment
    );

    res.status(201).json({ review });
  } catch (error) {
    next(error);
  }
}

export async function getDriverReviewsHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { driverId } = req.params;

    const reviews = await getDriverReviews(driverId);

    res.json({ reviews });
  } catch (error) {
    next(error);
  }
}

export async function getReviewByReservationHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { reservationId } = req.params;

    const review = await getReviewByReservation(reservationId);

    res.json({ review });
  } catch (error) {
    next(error);
  }
}
