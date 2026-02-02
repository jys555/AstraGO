import prisma from '../config/database';
import { ReservationStatus } from '@prisma/client';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors';
import { reserveSeats, releaseSeats } from './seatAvailabilityService';
import { generateChatDeepLink } from './telegramService';
import { updateDriverMetrics } from './driverRankingService';
import { sendNotification, NotificationType } from './notificationService';

const RESERVATION_DURATION_MS = 10 * 60 * 1000; // 10 minutes
const DRIVER_RESPONSE_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes

/**
 * Create a soft reservation (10-minute window)
 * Only one active reservation per passenger at a time
 */
export async function createReservation(
  tripId: string,
  passengerId: string,
  seatCount: number = 1
) {
  // Check if trip exists and has available seats
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { driver: true },
  });

  if (!trip) {
    throw new NotFoundError('Trip');
  }

  // Prevent driver from reserving their own trip
  if (trip.driverId === passengerId) {
    throw new ValidationError('Drivers cannot reserve seats on their own trips');
  }

  if (trip.status !== 'ACTIVE') {
    throw new ValidationError('Trip is not active');
  }

  if (trip.availableSeats < seatCount) {
    throw new ConflictError('Not enough available seats');
  }

  // Check if passenger already has an active reservation
  const existingReservation = await prisma.reservation.findFirst({
    where: {
      passengerId,
      status: 'PENDING',
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (existingReservation) {
    // Cancel the existing reservation
    await cancelReservation(existingReservation.id, passengerId);
  }

  // Create new reservation
  const expiresAt = new Date(Date.now() + RESERVATION_DURATION_MS);
  const reservation = await prisma.reservation.create({
    data: {
      tripId,
      passengerId,
      seatCount,
      expiresAt,
      status: 'PENDING',
    },
    include: {
      trip: {
        include: {
          driver: {
            select: {
              id: true,
              telegramId: true,
              username: true,
              phone: true,
            },
          },
        },
      },
      passenger: {
        select: {
          id: true,
          telegramId: true,
        },
      },
    },
  });

  // Reserve seats
  await reserveSeats(tripId, seatCount);

  // Create chat session with Telegram deep link
  const chatLink = generateChatDeepLink(
    trip.driver.username || undefined,
    trip.driver.phone || undefined
  );

  const chat = await prisma.chat.create({
    data: {
      reservationId: reservation.id,
      tripId: trip.id,
      driverId: trip.driverId,
      passengerId,
      telegramLink: chatLink,
      status: 'ACTIVE',
    },
  });

  // Send notification to driver about new reservation
  try {
    await sendNotification(
      trip.driver.telegramId,
      NotificationType.DRIVER_REPLIED,
      trip.id,
      reservation.id
    );
  } catch (error) {
    console.error('Failed to send reservation notification to driver:', error);
  }

  // Schedule expiration notification (2 minutes before expiry)
  setTimeout(async () => {
    try {
      const reservationCheck = await prisma.reservation.findUnique({
        where: { id: reservation.id },
        include: { passenger: true },
      });
      
      if (reservationCheck && reservationCheck.status === 'PENDING') {
        await sendNotification(
          reservationCheck.passenger.telegramId,
          NotificationType.RESERVATION_EXPIRING_2MIN,
          trip.id,
          reservation.id
        );
      }
    } catch (error) {
      console.error('Failed to send expiration notification:', error);
    }
  }, RESERVATION_DURATION_MS - 2 * 60 * 1000); // 2 minutes before expiry

  return {
    ...reservation,
    chat,
  };
}

/**
 * Confirm a reservation (after negotiation)
 */
export async function confirmReservation(
  reservationId: string,
  userId: string
) {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: {
      trip: {
        include: { driver: true },
      },
      passenger: true,
    },
  });

  if (!reservation) {
    throw new NotFoundError('Reservation');
  }

  // Only passenger or driver can confirm
  if (
    reservation.passengerId !== userId &&
    reservation.trip.driverId !== userId
  ) {
    throw new ConflictError('Not authorized to confirm this reservation');
  }

  if (reservation.status !== 'PENDING') {
    throw new ConflictError('Reservation is not pending');
  }

  if (reservation.expiresAt < new Date()) {
    throw new ConflictError('Reservation has expired');
  }

  // Calculate driver response time if passenger is confirming
  let responseTime: number | undefined;
  if (reservation.passengerId === userId) {
    const now = Date.now();
    const reservedAt = reservation.reservedAt.getTime();
    responseTime = (now - reservedAt) / 1000; // in seconds
  }

  // Update reservation
  const updated = await prisma.reservation.update({
    where: { id: reservationId },
    data: {
      status: 'CONFIRMED',
      confirmedAt: new Date(),
    },
    include: {
      trip: {
        select: {
          id: true,
        },
      },
      passenger: {
        select: {
          id: true,
          telegramId: true,
        },
      },
    },
  });

  // Update driver metrics
  await updateDriverMetrics(
    reservation.trip.driverId,
    responseTime,
    true // confirmed
  );

  // Send notification to passenger about confirmation
  try {
    await sendNotification(
      reservation.passenger.telegramId,
      NotificationType.TRIP_CONFIRMED,
      reservation.trip.id,
      reservation.id
    );
  } catch (error) {
    console.error('Failed to send confirmation notification:', error);
  }

  return updated;
}

/**
 * Cancel a reservation
 */
export async function cancelReservation(
  reservationId: string,
  userId: string
) {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { trip: true },
  });

  if (!reservation) {
    throw new NotFoundError('Reservation');
  }

  // Only passenger or driver can cancel
  if (
    reservation.passengerId !== userId &&
    reservation.trip.driverId !== userId
  ) {
    throw new ConflictError('Not authorized to cancel this reservation');
  }

  // Release seats
  await releaseSeats(reservation.tripId, reservation.seatCount);

  // Update reservation
  const updated = await prisma.reservation.update({
    where: { id: reservationId },
    data: {
      status: 'CANCELLED',
    },
  });

  // Archive chat
  await prisma.chat.updateMany({
    where: { reservationId },
    data: {
      status: 'ARCHIVED',
      archivedAt: new Date(),
    },
  });

  return updated;
}

/**
 * Expire a reservation (called by cron job or scheduled task)
 */
export async function expireReservation(reservationId: string) {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { trip: true },
  });

  if (!reservation || reservation.status !== 'PENDING') {
    return;
  }

  // Release seats
  await releaseSeats(reservation.tripId, reservation.seatCount);

  // Update reservation
  await prisma.reservation.update({
    where: { id: reservationId },
    data: {
      status: 'EXPIRED',
    },
  });

  // Archive chat (read-only)
  await prisma.chat.updateMany({
    where: { reservationId },
    data: {
      status: 'READ_ONLY',
      archivedAt: new Date(),
    },
  });

  // Update driver metrics (no response)
  await updateDriverMetrics(reservation.trip.driverId, undefined, false);
}

/**
 * Get active reservation for a passenger
 */
export async function getActiveReservation(passengerId: string) {
  return prisma.reservation.findFirst({
    where: {
      passengerId,
      status: 'PENDING',
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      trip: {
        include: {
          driver: {
            include: {
              driverMetrics: true,
            },
          },
        },
      },
      chat: true,
    },
  });
}

/**
 * Check if driver has responded (within 2 minutes)
 */
export async function checkDriverResponse(reservationId: string): Promise<boolean> {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { trip: true },
  });

  if (!reservation) {
    return false;
  }

  // Check if driver is online and has been active
  const driver = await prisma.user.findUnique({
    where: { id: reservation.trip.driverId },
  });

  if (!driver) {
    return false;
  }

  // Driver is considered responsive if:
  // 1. Online, AND
  // 2. Last seen within 2 minutes of reservation creation
  const twoMinutesAgo = new Date(Date.now() - DRIVER_RESPONSE_TIMEOUT_MS);
  const reservationTime = reservation.reservedAt;

  return (
    driver.onlineStatus &&
    driver.lastSeen >= reservationTime &&
    driver.lastSeen >= twoMinutesAgo
  );
}

/**
 * Auto-expire old reservations (should be called periodically)
 */
export async function expireOldReservations() {
  const expired = await prisma.reservation.findMany({
    where: {
      status: 'PENDING',
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  for (const reservation of expired) {
    await expireReservation(reservation.id);
  }

  return expired.length;
}

/**
 * Get all reservations for a passenger (all statuses)
 */
export async function getMyReservationsAsPassenger(passengerId: string) {
  return prisma.reservation.findMany({
    where: {
      passengerId,
      status: {
        in: ['PENDING', 'CONFIRMED', 'CANCELLED', 'EXPIRED'],
      },
    },
    include: {
      trip: {
        include: {
          driver: {
            include: {
              driverMetrics: true,
            },
          },
        },
      },
      chat: true,
      review: {
        select: {
          id: true,
          rating: true,
          reason: true,
          comment: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}
