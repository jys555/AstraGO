import { Trip, Reservation, User, TripFilters, DriverMetrics } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Get Telegram initData if available
    const initData = typeof window !== 'undefined' 
      ? (window as any).Telegram?.WebApp?.initData 
      : null;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (initData) {
      headers['x-telegram-init-data'] = initData;
    }

    // For development, allow bypassing auth
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      const devUserId = localStorage.getItem('dev_user_id');
      if (devUserId) {
        headers['x-dev-user-id'] = devUserId;
      }
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Request failed' } }));
      throw new Error(error.error?.message || 'Request failed');
    }

    return response.json();
  }

  // Trips
  async getTrips(filters?: TripFilters): Promise<{ trips: Trip[] }> {
    const params = new URLSearchParams();
    if (filters?.routeFrom) params.append('routeFrom', filters.routeFrom);
    if (filters?.routeTo) params.append('routeTo', filters.routeTo);
    if (filters?.date) params.append('date', filters.date);
    if (filters?.onlineOnly) params.append('onlineOnly', 'true');
    if (filters?.homePickup) params.append('homePickup', 'true');
    if (filters?.cargoAccepted) params.append('cargoAccepted', 'true');
    if (filters?.earliestDeparture) params.append('earliestDeparture', 'true');
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.order) params.append('order', filters.order);

    return this.request<{ trips: Trip[] }>(`/api/trips?${params.toString()}`);
  }

  async getTrip(id: string): Promise<{ trip: Trip }> {
    return this.request<{ trip: Trip }>(`/api/trips/${id}`);
  }

  async createTrip(data: any): Promise<{ trip: Trip }> {
    return this.request<{ trip: Trip }>('/api/trips', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTrip(id: string, data: any): Promise<{ trip: Trip }> {
    return this.request<{ trip: Trip }>(`/api/trips/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async updateTripSeats(id: string, availableSeats: number): Promise<{ trip: Trip }> {
    return this.request<{ trip: Trip }>(`/api/trips/${id}/seats`, {
      method: 'PATCH',
      body: JSON.stringify({ availableSeats }),
    });
  }

  // Reservations
  async createReservation(tripId: string, seatCount: number = 1): Promise<{ reservation: Reservation }> {
    return this.request<{ reservation: Reservation }>('/api/reservations', {
      method: 'POST',
      body: JSON.stringify({ tripId, seatCount }),
    });
  }

  async getReservation(id: string): Promise<{ reservation: Reservation; driverResponded: boolean }> {
    return this.request<{ reservation: Reservation; driverResponded: boolean }>(`/api/reservations/${id}`);
  }

  async getActiveReservation(): Promise<{ reservation: Reservation | null; driverResponded: boolean }> {
    return this.request<{ reservation: Reservation | null; driverResponded: boolean }>('/api/reservations/active');
  }

  async confirmReservation(id: string): Promise<{ reservation: Reservation }> {
    return this.request<{ reservation: Reservation }>(`/api/reservations/${id}/confirm`, {
      method: 'PATCH',
    });
  }

  async cancelReservation(id: string): Promise<{ reservation: Reservation }> {
    return this.request<{ reservation: Reservation }>(`/api/reservations/${id}`, {
      method: 'DELETE',
    });
  }

  // Users
  async getCurrentUser(): Promise<{ user: User } | null> {
    try {
      return await this.request<{ user: User }>('/api/users/me');
    } catch (error: any) {
      // 401 means user not registered - this is normal, return null
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        return null;
      }
      throw error;
    }
  }

  async registerUser(data: {
    firstName: string;
    lastName?: string;
    phone: string;
    role: 'PASSENGER' | 'DRIVER' | 'BOTH';
    carNumber?: string;
    carModel?: string;
    carColor?: string;
  }): Promise<{ user: User }> {
    return this.request<{ user: User }>('/api/users/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCurrentUser(data: Partial<User>): Promise<{ user: User }> {
    return this.request<{ user: User }>('/api/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getDriverMetrics(driverId: string): Promise<{ metrics: DriverMetrics }> {
    return this.request<{ metrics: DriverMetrics }>(`/api/users/drivers/${driverId}/metrics`);
  }
}

export const apiClient = new ApiClient(API_URL);
