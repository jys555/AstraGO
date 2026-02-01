import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { updateDriverMetrics } from './driverRankingService';

/**
 * Create a review for a completed trip
 * Only passengers who had CONFIRMED reservations can review
 */
export async function createReview(
  reservationId: string,
  passengerId: string,
  rating: number,
  reason?: string,
  comment?: string
) {
  // Check if reservation exists and belongs to passenger
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: {
      trip: true,
    },
  });

  if (!reservation) {
    throw new NotFoundError('Reservation');
  }

  if (reservation.passengerId !== passengerId) {
    throw new ValidationError('Not authorized to review this trip');
  }

  if (reservation.status !== 'CONFIRMED') {
    throw new ValidationError('Only confirmed reservations can be reviewed');
  }

  if (reservation.trip.status !== 'COMPLETED') {
    throw new ValidationError('Can only review completed trips');
  }

  // Check if review already exists
  const existingReview = await prisma.tripReview.findUnique({
    where: { reservationId },
  });

  if (existingReview) {
    throw new ValidationError('Review already exists for this reservation');
  }

  // Validate rating
  if (rating < 1 || rating > 5) {
    throw new ValidationError('Rating must be between 1 and 5');
  }

  // Create review
  const review = await prisma.tripReview.create({
    data: {
      tripId: reservation.tripId,
      reservationId,
      passengerId,
      driverId: reservation.trip.driverId,
      rating,
      reason: reason as any,
      comment: comment || null,
    },
    include: {
      passenger: true,
      driver: true,
      trip: true,
    },
  });

  // Update driver metrics with new rating
  // Calculate average rating for driver
  const allReviews = await prisma.tripReview.findMany({
    where: { driverId: reservation.trip.driverId },
    select: { rating: true },
  });

  const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

  // Note: We can add avgRating to DriverMetrics if needed
  // For now, we'll just update the driver metrics with the new review count

  return review;
}

/**
 * Get reviews for a driver
 */
export async function getDriverReviews(driverId: string) {
  return prisma.tripReview.findMany({
    where: { driverId },
    include: {
      passenger: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      trip: {
        select: {
          id: true,
          routeFrom: true,
          routeTo: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Get review for a specific reservation
 */
export async function getReviewByReservation(reservationId: string) {
  return prisma.tripReview.findUnique({
    where: { reservationId },
    include: {
      passenger: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      trip: {
        select: {
          id: true,
          routeFrom: true,
          routeTo: true,
        },
      },
    },
  });
}
