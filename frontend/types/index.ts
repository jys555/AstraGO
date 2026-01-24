export interface User {
  id: string;
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: 'PASSENGER' | 'DRIVER' | 'BOTH';
  onlineStatus: boolean;
  lastSeen: string;
  driverMetrics?: DriverMetrics;
}

export interface Trip {
  id: string;
  driverId: string;
  routeFrom: string;
  routeTo: string;
  departureWindowStart: string;
  departureWindowEnd: string;
  vehicleType: string;
  totalSeats: number;
  availableSeats: number;
  pickupType: 'STATION_ONLY' | 'HOME_PICKUP';
  deliveryType: 'PASSENGER_ONLY' | 'CARGO_ACCEPTED';
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  driver: User;
  seatAvailability?: SeatAvailability;
}

export interface Reservation {
  id: string;
  tripId: string;
  passengerId: string;
  seatCount: number;
  reservedAt: string;
  expiresAt: string;
  status: 'PENDING' | 'CONFIRMED' | 'EXPIRED' | 'CANCELLED';
  confirmedAt?: string;
  createdAt: string;
  updatedAt: string;
  trip: Trip;
  passenger: User;
  chat?: Chat;
}

export interface Chat {
  id: string;
  reservationId: string;
  driverId: string;
  passengerId: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'READ_ONLY';
  telegramLink?: string;
  createdAt: string;
  archivedAt?: string;
}

export interface SeatAvailability {
  id: string;
  tripId: string;
  reservedSeats: number;
  availableSeats: number;
  updatedAt: string;
}

export interface DriverMetrics {
  id: string;
  driverId: string;
  avgResponseTime: number | null;
  responseRate: number;
  totalTrips: number;
  totalReservations: number;
  confirmedReservations: number;
  rankingScore: number;
  lastUpdated: string;
}

export interface TripFilters {
  routeFrom?: string;
  routeTo?: string;
  date?: string;
  onlineOnly?: boolean;
  homePickup?: boolean;
  cargoAccepted?: boolean;
  earliestDeparture?: boolean;
  sortBy?: 'departure' | 'seats' | 'ranking';
  order?: 'asc' | 'desc';
}
