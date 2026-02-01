import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { calculateRankingScore, calculateReliabilityScore } from './driverRankingService';

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

  const avgRating = allReviews.length > 0
    ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
    : null;

  // Update driver metrics with new rating
  const metrics = await prisma.driverMetrics.findUnique({
    where: { driverId: reservation.trip.driverId },
  });

  const driver = await prisma.user.findUnique({
    where: { id: reservation.trip.driverId },
  });

  if (driver && metrics) {
    // Recalculate ranking score with new rating
    const reliabilityScore = calculateReliabilityScore(
      metrics.totalTrips,
      metrics.cancelledTripsWithPassengers
    );
    
    const rankingScore = calculateRankingScore(
      metrics.avgResponseTime,
      metrics.responseRate,
      metrics.totalTrips,
      metrics.cancelledTripsWithPassengers,
      avgRating,
      driver.onlineStatus
    );

    await prisma.driverMetrics.update({
      where: { driverId: reservation.trip.driverId },
      data: {
        avgRating,
        totalReviews: allReviews.length,
        reliabilityScore,
        rankingScore,
        lastUpdated: new Date(),
      },
    });
  }

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
