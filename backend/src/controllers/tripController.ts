import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { updateSeatAvailability } from '../services/seatAvailabilityService';
import { getDriverRanking, updateDriverMetricsOnTripCancellation, calculateReliabilityScore, calculateRankingScore } from '../services/driverRankingService';
import { CreateTripInput, UpdateTripInput, TripFilters, TripSortOptions } from '../types';

export async function getTrips(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const {
      routeFrom,
      routeTo,
      date,
      onlineOnly,
      homePickup,
      cargoAccepted,
      earliestDeparture,
      sortBy = 'departure',
      order = 'asc',
    } = req.query as any;

    const where: any = {
      status: 'ACTIVE',
    };

    if (routeFrom) {
      where.routeFrom = { contains: routeFrom, mode: 'insensitive' };
    }

    if (routeTo) {
      where.routeTo = { contains: routeTo, mode: 'insensitive' };
    }

    if (date) {
      const dateObj = new Date(date as string);
      const nextDay = new Date(dateObj);
      nextDay.setDate(nextDay.getDate() + 1);
      where.departureWindowStart = {
        gte: dateObj,
        lt: nextDay,
      };
    }

    if (homePickup === 'true') {
      where.pickupType = 'HOME_PICKUP';
    }

    if (cargoAccepted === 'true') {
      where.deliveryType = 'CARGO_ACCEPTED';
    }

    const trips = await prisma.trip.findMany({
      where,
      include: {
        driver: {
          include: {
            driverMetrics: true,
          },
        },
        seatAvailability: true,
      },
    });

    // Filter by online status if requested
    let filteredTrips = onlineOnly === 'true'
      ? trips.filter((t: any) => t.driver.onlineStatus)
      : trips;

    // Sort trips
    filteredTrips.sort((a: any, b: any) => {
      // First: Online drivers first
      if (a.driver.onlineStatus !== b.driver.onlineStatus) {
        return a.driver.onlineStatus ? -1 : 1;
      }

      let comparison = 0;

      switch (sortBy) {
        case 'departure':
          comparison =
            a.departureWindowStart.getTime() - b.departureWindowStart.getTime();
          break;
        case 'seats':
          comparison = b.availableSeats - a.availableSeats;
          break;
        case 'ranking':
          const scoreA = a.driver.driverMetrics?.rankingScore || 0;
          const scoreB = b.driver.driverMetrics?.rankingScore || 0;
          comparison = scoreB - scoreA;
          break;
        default:
          comparison =
            a.departureWindowStart.getTime() - b.departureWindowStart.getTime();
      }

      return order === 'asc' ? comparison : -comparison;
    });

    // If earliestDeparture, prioritize trips starting soonest
    if (earliestDeparture === 'true') {
      filteredTrips.sort((a: any, b: any) => {
        if (a.driver.onlineStatus !== b.driver.onlineStatus) {
          return a.driver.onlineStatus ? -1 : 1;
        }
        return (
          a.departureWindowStart.getTime() - b.departureWindowStart.getTime()
        );
      });
    }

    res.json({ trips: filteredTrips });
  } catch (error) {
    next(error);
  }
}

export async function getTripById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        driver: {
          include: {
            driverMetrics: true,
          },
        },
        seatAvailability: true,
        reservations: {
          where: {
            status: { in: ['PENDING', 'CONFIRMED'] },
          },
          include: {
            passenger: true,
          },
        },
      },
    });

    if (!trip) {
      throw new NotFoundError('Trip');
    }

    res.json({ trip });
  } catch (error) {
    next(error);
  }
}

export async function createTrip(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user;
    if (!user) {
      throw new ValidationError('User not authenticated');
    }

    const data: CreateTripInput = req.body;

    // Validate departure window
    const start = new Date(data.departureWindowStart);
    const end = new Date(data.departureWindowEnd);

    if (start >= end) {
      throw new ValidationError('Departure window end must be after start');
    }

    if (start < new Date()) {
      throw new ValidationError('Departure window cannot be in the past');
    }

    // Calculate duration if not provided
    const durationHours = data.durationHours || ((end.getTime() - start.getTime()) / (1000 * 60 * 60));

    const trip = await prisma.trip.create({
      data: {
        driverId: user.id,
        routeFrom: data.routeFrom,
        routeTo: data.routeTo,
        departureWindowStart: start,
        departureWindowEnd: end,
        durationHours,
        vehicleType: data.vehicleType,
        totalSeats: data.totalSeats,
        availableSeats: data.totalSeats,
        pickupType: data.pickupType,
        deliveryType: data.deliveryType,
      },
      include: {
        driver: {
          include: {
            driverMetrics: true,
          },
        },
      },
    });

    // Create initial seat availability record
    await prisma.seatAvailability.create({
      data: {
        tripId: trip.id,
        reservedSeats: 0,
        availableSeats: trip.totalSeats,
      },
    });

    // Update driver metrics: increment totalTrips
    const metrics = await prisma.driverMetrics.findUnique({
      where: { driverId: user.id },
    });

    const totalTrips = (metrics?.totalTrips || 0) + 1;
    const cancelledTripsWithPassengers = metrics?.cancelledTripsWithPassengers || 0;
    
    // Recalculate reliability and ranking scores
    const reliabilityScore = calculateReliabilityScore(totalTrips, cancelledTripsWithPassengers);
    const rankingScore = calculateRankingScore(
      metrics?.avgResponseTime || null,
      metrics?.responseRate || 0,
      totalTrips,
      cancelledTripsWithPassengers,
      metrics?.avgRating || null,
      user.onlineStatus
    );

    await prisma.driverMetrics.upsert({
      where: { driverId: user.id },
      create: {
        driverId: user.id,
        avgResponseTime: null,
        responseRate: 0,
        totalReservations: 0,
        confirmedReservations: 0,
        totalTrips,
        cancelledTrips: 0,
        cancelledTripsWithPassengers: 0,
        reliabilityScore,
        avgRating: null,
        totalReviews: 0,
        rankingScore,
      },
      update: {
        totalTrips,
        reliabilityScore,
        rankingScore,
        lastUpdated: new Date(),
      },
    });

    res.status(201).json({ trip });
  } catch (error) {
    next(error);
  }
}

export async function updateTrip(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const data: UpdateTripInput = req.body;

    const trip = await prisma.trip.findUnique({
      where: { id },
    });

    if (!trip) {
      throw new NotFoundError('Trip');
    }

    if (trip.driverId !== user.id) {
      throw new ValidationError('Not authorized to update this trip');
    }

    const updateData: any = {};

    if (data.routeFrom) updateData.routeFrom = data.routeFrom;
    if (data.routeTo) updateData.routeTo = data.routeTo;
    if (data.departureWindowStart)
      updateData.departureWindowStart = new Date(data.departureWindowStart);
    if (data.departureWindowEnd)
      updateData.departureWindowEnd = new Date(data.departureWindowEnd);
    if (data.vehicleType) updateData.vehicleType = data.vehicleType;
    if (data.totalSeats !== undefined) {
      updateData.totalSeats = data.totalSeats;
      // Adjust available seats if total changes
      if (data.totalSeats < trip.totalSeats) {
        const diff = trip.totalSeats - data.totalSeats;
        updateData.availableSeats = Math.max(0, trip.availableSeats - diff);
      } else {
        const diff = data.totalSeats - trip.totalSeats;
        updateData.availableSeats = trip.availableSeats + diff;
      }
    }
    if (data.pickupType) updateData.pickupType = data.pickupType;
    if (data.deliveryType) updateData.deliveryType = data.deliveryType;
    if (data.status) updateData.status = data.status;

    const updated = await prisma.trip.update({
      where: { id },
      data: updateData,
      include: {
        driver: {
          include: {
            driverMetrics: true,
          },
        },
      },
    });

    res.json({ trip: updated });
  } catch (error) {
    next(error);
  }
}

export async function updateTripSeats(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { availableSeats } = req.body;

    const trip = await prisma.trip.findUnique({
      where: { id },
    });

    if (!trip) {
      throw new NotFoundError('Trip');
    }

    if (trip.driverId !== user.id) {
      throw new ValidationError('Not authorized to update this trip');
    }

    if (availableSeats < 0 || availableSeats > trip.totalSeats) {
      throw new ValidationError(
        'Available seats must be between 0 and total seats'
      );
    }

    const seatChange = availableSeats - trip.availableSeats;
    await updateSeatAvailability(id, seatChange);

    const updated = await prisma.trip.findUnique({
      where: { id },
      include: {
        driver: {
          include: {
            driverMetrics: true,
          },
        },
      },
    });

    res.json({ trip: updated });
  } catch (error) {
    next(error);
  }
}

// Get trips created by current driver
export async function getMyTripsAsDriver(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user;
    const now = new Date();
    // Only show trips from last 3 days for drivers
    const threeDaysAgo = new Date(now);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    const trips = await prisma.trip.findMany({
      where: {
        driverId: user.id,
        createdAt: {
          gte: threeDaysAgo, // Only trips from last 3 days
        },
      },
      include: {
        driver: {
          include: {
            driverMetrics: true,
          },
        },
        seatAvailability: true,
        reservations: {
          include: {
            passenger: true,
            chat: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Auto-expire trips that have passed their departure window
    // Update trips where departureWindowEnd has passed and status is still ACTIVE
    const expiredTrips = trips.filter(
      (trip) => trip.status === 'ACTIVE' && new Date(trip.departureWindowEnd) < now
    );

    if (expiredTrips.length > 0) {
      await prisma.trip.updateMany({
        where: {
          id: { in: expiredTrips.map((t) => t.id) },
          status: 'ACTIVE',
        },
        data: {
          status: 'COMPLETED',
        },
      });

      // Archive chats for completed trips
      for (const trip of expiredTrips) {
        await prisma.chat.updateMany({
          where: {
            tripId: trip.id,
            status: { in: ['ACTIVE'] },
          },
          data: {
            status: 'ARCHIVED',
            archivedAt: new Date(),
          },
        });
      }
    }

    // Refetch trips to get updated statuses
    const updatedTrips = await prisma.trip.findMany({
      where: {
        driverId: user.id,
      },
      include: {
        driver: {
          include: {
            driverMetrics: true,
          },
        },
        seatAvailability: true,
        reservations: {
          include: {
            passenger: true,
            chat: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ trips: updatedTrips });
  } catch (error) {
    next(error);
  }
}

// Complete/close a trip (driver only)
export async function completeTrip(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        reservations: {
          where: {
            status: { in: ['PENDING', 'CONFIRMED'] },
          },
          include: {
            passenger: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!trip) {
      throw new NotFoundError('Trip');
    }

    if (trip.driverId !== user.id) {
      throw new ValidationError('Not authorized to complete this trip');
    }

    if (trip.status !== 'ACTIVE') {
      throw new ValidationError('Only active trips can be completed');
    }

    // Update trip status to COMPLETED
    const updated = await prisma.trip.update({
      where: { id },
      data: {
        status: 'COMPLETED',
      },
      include: {
        driver: {
          include: {
            driverMetrics: true,
          },
        },
        seatAvailability: true,
        reservations: {
          where: {
            status: 'CONFIRMED', // Only return confirmed reservations for review
          },
          include: {
            passenger: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            chat: true,
            review: true, // Include review if exists
          },
        },
      },
    });

    // Archive all active chats for this trip
    await prisma.chat.updateMany({
      where: {
        tripId: id,
        status: { in: ['ACTIVE'] },
      },
      data: {
        status: 'ARCHIVED',
        archivedAt: new Date(),
      },
    });

    res.json({ trip: updated });
  } catch (error) {
    next(error);
  }
}

// Cancel a trip (driver only)
export async function cancelTrip(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        reservations: {
          where: {
            status: { in: ['PENDING', 'CONFIRMED'] },
          },
          include: {
            passenger: true,
          },
        },
      },
    });

    if (!trip) {
      throw new NotFoundError('Trip');
    }

    if (trip.driverId !== user.id) {
      throw new ValidationError('Not authorized to cancel this trip');
    }

    if (trip.status !== 'ACTIVE') {
      throw new ValidationError('Only active trips can be cancelled');
    }

    // Count passengers with active reservations
    const activeReservations = trip.reservations.filter(
      (r) => r.status === 'PENDING' || r.status === 'CONFIRMED'
    );
    const passengerCount = activeReservations.reduce(
      (sum, r) => sum + r.seatCount,
      0
    );
    const hadPassengers = passengerCount > 0;

    // Cancel all active reservations
    for (const reservation of activeReservations) {
      // Release seats
      await updateSeatAvailability(trip.id, -reservation.seatCount);

      // Update reservation status
      await prisma.reservation.update({
        where: { id: reservation.id },
        data: {
          status: 'CANCELLED',
        },
      });

      // Archive chat
      await prisma.chat.updateMany({
        where: {
          reservationId: reservation.id,
        },
        data: {
          status: 'ARCHIVED',
          archivedAt: new Date(),
        },
      });
    }

    // Update trip status to CANCELLED
    const updated = await prisma.trip.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
      include: {
        driver: {
          include: {
            driverMetrics: true,
          },
        },
        seatAvailability: true,
        reservations: {
          include: {
            passenger: true,
            chat: true,
          },
        },
      },
    });

    // Update driver metrics with penalty (only if had passengers)
    if (hadPassengers) {
      await updateDriverMetricsOnTripCancellation(
        user.id,
        true,
        passengerCount
      );
    } else {
      // No penalty if no passengers, but still track cancellation
      await updateDriverMetricsOnTripCancellation(
        user.id,
        false,
        0
      );
    }

    res.json({ trip: updated });
  } catch (error) {
    next(error);
  }
}
