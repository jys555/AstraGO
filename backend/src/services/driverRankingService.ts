import prisma from '../config/database';

export interface DriverRankingMetrics {
  driverId: string;
  rankingScore: number;
  avgResponseTime: number | null;
  responseRate: number;
  totalTrips: number;
  onlineStatus: boolean;
}

/**
 * Calculate ranking score for a driver
 * Higher score = better ranking
 * 
 * Factors:
 * - Response time (faster = higher score)
 * - Response rate (higher = higher score)
 * - Online status (online = bonus)
 * - Total trips (more = slight bonus)
 */
export function calculateRankingScore(
  avgResponseTime: number | null,
  responseRate: number,
  totalTrips: number,
  onlineStatus: boolean
): number {
  let score = 0;

  // Response time component (0-40 points)
  // Faster response = higher score
  if (avgResponseTime !== null) {
    if (avgResponseTime <= 60) {
      // Responded within 1 minute
      score += 40;
    } else if (avgResponseTime <= 120) {
      // Responded within 2 minutes
      score += 30;
    } else if (avgResponseTime <= 300) {
      // Responded within 5 minutes
      score += 20;
    } else {
      // Responded after 5 minutes
      score += 10;
    }
  } else {
    // No response time data (new driver)
    score += 20;
  }

  // Response rate component (0-30 points)
  // Higher response rate = higher score
  score += (responseRate / 100) * 30;

  // Online status bonus (0-20 points)
  if (onlineStatus) {
    score += 20;
  }

  // Total trips component (0-10 points)
  // More trips = slight bonus (diminishing returns)
  if (totalTrips >= 50) {
    score += 10;
  } else if (totalTrips >= 20) {
    score += 7;
  } else if (totalTrips >= 10) {
    score += 5;
  } else if (totalTrips >= 5) {
    score += 3;
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

  const rankingScore = calculateRankingScore(
    avgResponseTime,
    responseRate,
    metrics?.totalTrips || 0,
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
      rankingScore,
    },
    update: {
      avgResponseTime,
      responseRate,
      totalReservations,
      confirmedReservations: newConfirmedReservations,
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
    onlineStatus: driver.onlineStatus,
  };
}
