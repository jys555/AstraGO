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
    // Remove leading slash from endpoint to avoid double slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    // Ensure baseUrl doesn't end with slash
    const cleanBaseUrl = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
    const url = `${cleanBaseUrl}/${cleanEndpoint}`;
    
    // Get Telegram initData - REQUIRED for authentication
    const initData = typeof window !== 'undefined' 
      ? (window as any).Telegram?.WebApp?.initData 
      : null;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    // Always send initData if available (Telegram Mini App)
    if (initData) {
      headers['x-telegram-init-data'] = initData;
    } else {
      // If not in Telegram, try to get from localStorage (for web.telegram.org where SDK loads later)
      // In development, we can allow bypass
      if (process.env.NODE_ENV === 'development') {
        const devUserId = localStorage.getItem('dev_user_id');
        if (devUserId) {
          headers['x-dev-user-id'] = devUserId;
        }
      }
      // Don't show warning in production if we're in web.telegram.org (SDK might load later)
      if (!window.location.hostname.includes('telegram.org')) {
        console.warn('Not running in Telegram Mini App - authentication may fail');
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
  async getCurrentUser(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/api/users/me');
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
