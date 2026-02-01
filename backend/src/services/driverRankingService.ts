import prisma from '../config/database';

export interface DriverRankingMetrics {
  driverId: string;
  rankingScore: number;
  avgResponseTime: number | null;
  responseRate: number;
  totalTrips: number;
  cancelledTrips: number;
  cancelledTripsWithPassengers: number;
  reliabilityScore: number;
  avgRating: number | null;
  totalReviews: number;
  onlineStatus: boolean;
}

/**
 * Calculate reliability score based on cancellation rate
 * Higher score = more reliable (less cancellations)
 * 
 * Formula:
 * - If no trips cancelled: 100
 * - If cancelled trips with passengers: penalty based on cancellation rate
 * - Cancellation rate = (cancelledTripsWithPassengers / totalTrips) * 100
 */
export function calculateReliabilityScore(
  totalTrips: number,
  cancelledTripsWithPassengers: number
): number {
  if (totalTrips === 0) {
    return 100; // New driver, assume reliable
  }

  const cancellationRate = (cancelledTripsWithPassengers / totalTrips) * 100;
  
  // Penalty: subtract points based on cancellation rate
  // 0% cancellation = 100 points
  // 10% cancellation = 90 points
  // 20% cancellation = 80 points
  // etc.
  const reliabilityScore = Math.max(0, 100 - cancellationRate);
  
  return Math.round(reliabilityScore * 100) / 100;
}

/**
 * Calculate ranking score for a driver
 * Higher score = better ranking
 * 
 * Factors:
 * - Response time (faster = higher score) - 0-25 points
 * - Response rate (higher = higher score) - 0-20 points
 * - Reliability score (less cancellations = higher score) - 0-20 points
 * - Average rating (higher = higher score) - 0-25 points
 * - Online status (online = bonus) - 0-5 points
 * - Total trips (more = slight bonus) - 0-5 points
 */
export function calculateRankingScore(
  avgResponseTime: number | null,
  responseRate: number,
  totalTrips: number,
  cancelledTripsWithPassengers: number,
  avgRating: number | null,
  onlineStatus: boolean
): number {
  let score = 0;

  // Response time component (0-25 points)
  // Faster response = higher score
  if (avgResponseTime !== null) {
    if (avgResponseTime <= 60) {
      // Responded within 1 minute
      score += 25;
    } else if (avgResponseTime <= 120) {
      // Responded within 2 minutes
      score += 20;
    } else if (avgResponseTime <= 300) {
      // Responded within 5 minutes
      score += 12;
    } else {
      // Responded after 5 minutes
      score += 5;
    }
  } else {
    // No response time data (new driver)
    score += 12;
  }

  // Response rate component (0-20 points)
  // Higher response rate = higher score
  score += (responseRate / 100) * 20;

  // Reliability component (0-20 points)
  // Higher reliability = higher score
  const reliabilityScore = calculateReliabilityScore(totalTrips, cancelledTripsWithPassengers);
  score += (reliabilityScore / 100) * 20;

  // Average rating component (0-25 points)
  // Higher rating = higher score (most important factor)
  if (avgRating !== null && avgRating > 0) {
    // Convert 1-5 rating to 0-25 points
    // 5 stars = 25 points, 4 stars = 20 points, etc.
    score += (avgRating / 5) * 25;
  } else {
    // No ratings yet (new driver) - neutral score
    score += 12.5;
  }

  // Online status bonus (0-5 points)
  if (onlineStatus) {
    score += 5;
  }

  // Total trips component (0-5 points)
  // More trips = slight bonus (diminishing returns)
  if (totalTrips >= 50) {
    score += 5;
  } else if (totalTrips >= 20) {
    score += 3;
  } else if (totalTrips >= 10) {
    score += 2;
  } else if (totalTrips >= 5) {
    score += 1;
  }

  return Math.round(score * 100) / 100; // Round to 2 decimal places
}

/**
 * Update driver metrics after a reservation interaction
 */
export async function updateDriverMetrics(
  driverId: string,
  responseTime?: number, // in seconds
  reservationConfirmed: boolean = false
): Promise<void> {
  const metrics = await prisma.driverMetrics.findUnique({
    where: { driverId },
  });

  const driver = await prisma.user.findUnique({
    where: { id: driverId },
  });

  if (!driver) {
    throw new Error('Driver not found');
  }

  const totalReservations = (metrics?.totalReservations || 0) + 1;
  const confirmedReservations = metrics?.confirmedReservations || 0;
  const newConfirmedReservations = reservationConfirmed
    ? confirmedReservations + 1
    : confirmedReservations;

  const responseRate = totalReservations > 0
    ? (newConfirmedReservations / totalReservations) * 100
    : 0;

  let avgResponseTime: number | null = null;
  if (responseTime !== undefined) {
    if (metrics?.avgResponseTime) {
      // Weighted average
      const totalResponses = metrics.totalReservations || 1;
      avgResponseTime =
        (metrics.avgResponseTime * totalResponses + responseTime) /
        (totalResponses + 1);
    } else {
      avgResponseTime = responseTime;
    }
  } else {
    avgResponseTime = metrics?.avgResponseTime || null;
  }

  const totalTrips = metrics?.totalTrips || 0;
  const cancelledTripsWithPassengers = metrics?.cancelledTripsWithPassengers || 0;
  const reliabilityScore = calculateReliabilityScore(totalTrips, cancelledTripsWithPassengers);
  const avgRating = metrics?.avgRating || null;
  
  const rankingScore = calculateRankingScore(
    avgResponseTime,
    responseRate,
    totalTrips,
    cancelledTripsWithPassengers,
    avgRating,
    driver.onlineStatus
  );

  await prisma.driverMetrics.upsert({
    where: { driverId },
    create: {
      driverId,
      avgResponseTime,
      responseRate,
      totalReservations,
      confirmedReservations: newConfirmedReservations,
      totalTrips: 0,
      cancelledTrips: 0,
      cancelledTripsWithPassengers: 0,
      reliabilityScore,
      avgRating: null,
      totalReviews: 0,
      rankingScore,
    },
    update: {
      avgResponseTime,
      responseRate,
      totalReservations,
      confirmedReservations: newConfirmedReservations,
      reliabilityScore,
      rankingScore,
      lastUpdated: new Date(),
    },
  });
}

/**
 * Get driver ranking metrics
 */
export async function getDriverRanking(driverId: string): Promise<DriverRankingMetrics | null> {
  const driver = await prisma.user.findUnique({
    where: { id: driverId },
    include: { driverMetrics: true },
  });

  if (!driver) {
    return null;
  }

  const metrics = driver.driverMetrics;

  return {
    driverId,
    rankingScore: metrics?.rankingScore || 0,
    avgResponseTime: metrics?.avgResponseTime || null,
    responseRate: metrics?.responseRate || 0,
    totalTrips: metrics?.totalTrips || 0,
    cancelledTrips: metrics?.cancelledTrips || 0,
    cancelledTripsWithPassengers: metrics?.cancelledTripsWithPassengers || 0,
    reliabilityScore: metrics?.reliabilityScore || 100,
    avgRating: metrics?.avgRating || null,
    totalReviews: metrics?.totalReviews || 0,
    onlineStatus: driver.onlineStatus,
  };
}

/**
 * Update driver metrics when a trip is cancelled
 * Penalty is applied only if trip had passengers
 */
export async function updateDriverMetricsOnTripCancellation(
  driverId: string,
  hadPassengers: boolean,
  passengerCount: number
): Promise<void> {
  const metrics = await prisma.driverMetrics.findUnique({
    where: { driverId },
  });

  const driver = await prisma.user.findUnique({
    where: { id: driverId },
  });

  if (!driver) {
    throw new Error('Driver not found');
  }

  const totalTrips = (metrics?.totalTrips || 0) + 1;
  const cancelledTrips = (metrics?.cancelledTrips || 0) + 1;
  const cancelledTripsWithPassengers = hadPassengers
    ? (metrics?.cancelledTripsWithPassengers || 0) + 1
    : (metrics?.cancelledTripsWithPassengers || 0);

  // Calculate reliability score
  const reliabilityScore = calculateReliabilityScore(totalTrips, cancelledTripsWithPassengers);

  // Recalculate ranking score with updated metrics
  const rankingScore = calculateRankingScore(
    metrics?.avgResponseTime || null,
    metrics?.responseRate || 0,
    totalTrips,
    cancelledTripsWithPassengers,
    metrics?.avgRating || null,
    driver.onlineStatus
  );

  await prisma.driverMetrics.upsert({
    where: { driverId },
    create: {
      driverId,
      avgResponseTime: null,
      responseRate: 0,
      totalReservations: 0,
      confirmedReservations: 0,
      totalTrips,
      cancelledTrips,
      cancelledTripsWithPassengers,
      reliabilityScore,
      avgRating: metrics?.avgRating || null,
      totalReviews: metrics?.totalReviews || 0,
      rankingScore,
    },
    update: {
      totalTrips,
      cancelledTrips,
      cancelledTripsWithPassengers,
      reliabilityScore,
      rankingScore,
      lastUpdated: new Date(),
    },
  });
}
