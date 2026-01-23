import { UserRole, TripStatus, ReservationStatus, PickupType, DeliveryType } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    telegramId: string;
    role: UserRole;
  };
}

export interface CreateTripInput {
  routeFrom: string;
  routeTo: string;
  departureWindowStart: string;
  departureWindowEnd: string;
  vehicleType: string;
  totalSeats: number;
  pickupType: PickupType;
  deliveryType: DeliveryType;
}

export interface UpdateTripInput {
  routeFrom?: string;
  routeTo?: string;
  departureWindowStart?: string;
  departureWindowEnd?: string;
  vehicleType?: string;
  totalSeats?: number;
  availableSeats?: number;
  pickupType?: PickupType;
  deliveryType?: DeliveryType;
  status?: TripStatus;
}

export interface CreateReservationInput {
  tripId: string;
  seatCount?: number;
}

export interface TripFilters {
  routeFrom?: string;
  routeTo?: string;
  date?: string;
  onlineOnly?: boolean;
  homePickup?: boolean;
  cargoAccepted?: boolean;
  earliestDeparture?: boolean;
}

export interface TripSortOptions {
  sortBy?: 'departure' | 'seats' | 'ranking';
  order?: 'asc' | 'desc';
}
