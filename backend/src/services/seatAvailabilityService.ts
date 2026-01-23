import prisma from '../config/database';

/**
 * Update seat availability for a trip
 * Ensures available seats never exceed total seats or go below 0
 */
export async function updateSeatAvailability(
  tripId: string,
  seatChange: number // positive = add seats, negative = remove seats
): Promise<void> {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { seatAvailability: true },
  });

  if (!trip) {
    throw new Error('Trip not found');
  }

  const currentAvailable = trip.availableSeats;
  const newAvailable = Math.max(0, Math.min(trip.totalSeats, currentAvailable + seatChange));

  // Update trip's available seats
  await prisma.trip.update({
    where: { id: tripId },
    data: { availableSeats: newAvailable },
  });

  // Update or create seat availability record
  await prisma.seatAvailability.upsert({
    where: { tripId },
    create: {
      tripId,
      reservedSeats: trip.totalSeats - newAvailable,
      availableSeats: newAvailable,
    },
    update: {
      reservedSeats: trip.totalSeats - newAvailable,
      availableSeats: newAvailable,
      updatedAt: new Date(),
    },
  });
}

/**
 * Get current seat availability for a trip
 */
export async function getSeatAvailability(tripId: string) {
  const seatAvailability = await prisma.seatAvailability.findUnique({
    where: { tripId },
    include: { trip: true },
  });

  if (!seatAvailability) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
    });

    if (!trip) {
      throw new Error('Trip not found');
    }

    return {
      tripId,
      totalSeats: trip.totalSeats,
      availableSeats: trip.availableSeats,
      reservedSeats: trip.totalSeats - trip.availableSeats,
    };
  }

  return {
    tripId,
    totalSeats: seatAvailability.trip.totalSeats,
    availableSeats: seatAvailability.availableSeats,
    reservedSeats: seatAvailability.reservedSeats,
  };
}

/**
 * Reserve seats (decrement available)
 */
export async function reserveSeats(tripId: string, seatCount: number): Promise<void> {
  await updateSeatAvailability(tripId, -seatCount);
}

/**
 * Release seats (increment available)
 */
export async function releaseSeats(tripId: string, seatCount: number): Promise<void> {
  await updateSeatAvailability(tripId, seatCount);
}
