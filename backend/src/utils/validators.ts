import { z } from 'zod';
import { PickupType, DeliveryType } from '@prisma/client';

export const createTripSchema = z.object({
  routeFrom: z.string().min(1, 'Route from is required'),
  routeTo: z.string().min(1, 'Route to is required'),
  departureWindowStart: z.string().datetime(),
  departureWindowEnd: z.string().datetime(),
  vehicleType: z.string().min(1, 'Vehicle type is required'),
  totalSeats: z.number().int().min(1).max(20),
  pickupType: z.nativeEnum(PickupType),
  deliveryType: z.nativeEnum(DeliveryType),
});

export const updateTripSchema = z.object({
  routeFrom: z.string().min(1).optional(),
  routeTo: z.string().min(1).optional(),
  departureWindowStart: z.string().datetime().optional(),
  departureWindowEnd: z.string().datetime().optional(),
  vehicleType: z.string().min(1).optional(),
  totalSeats: z.number().int().min(1).max(20).optional(),
  availableSeats: z.number().int().min(0).optional(),
  pickupType: z.nativeEnum(PickupType).optional(),
  deliveryType: z.nativeEnum(DeliveryType).optional(),
});

export const createReservationSchema = z.object({
  tripId: z.string().uuid(),
  seatCount: z.number().int().min(1).max(10).optional().default(1),
});

export const updateSeatsSchema = z.object({
  availableSeats: z.number().int().min(0),
});
