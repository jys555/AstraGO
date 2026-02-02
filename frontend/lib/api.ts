import { Trip, Reservation, User, TripFilters, DriverMetrics, Chat, ChatMessage } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    // Remove trailing slash to prevent double slashes
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Remove leading slash from endpoint to prevent double slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const url = `${this.baseUrl}/${cleanEndpoint}`;
    
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

  async getMyTripsAsDriver(): Promise<{ trips: Trip[] }> {
    return this.request<{ trips: Trip[] }>('/api/trips/my-trips/driver');
  }

  // Chat methods
  async getMyChats(): Promise<{ chats: Chat[] }> {
    return this.request<{ chats: Chat[] }>('/api/chats');
  }

  async getChatById(chatId: string): Promise<{ chat: Chat }> {
    return this.request<{ chat: Chat }>(`/api/chats/${chatId}`);
  }

  async getChatByReservation(reservationId: string): Promise<{ chat: Chat }> {
    return this.request<{ chat: Chat }>(`/api/chats/reservation/${reservationId}`);
  }

  async getChatMessages(chatId: string): Promise<{ messages: ChatMessage[] }> {
    return this.request<{ messages: ChatMessage[] }>(`/api/chats/${chatId}/messages`);
  }

  async sendMessage(chatId: string, content: string): Promise<{ message: ChatMessage }> {
    return this.request<{ message: ChatMessage }>(`/api/chats/${chatId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });
  }

  async markChatAsRead(chatId: string, messageIds?: string[]): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/chats/${chatId}/read`, {
      method: 'POST',
      body: JSON.stringify({ messageIds }),
    });
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

  async completeTrip(id: string): Promise<{ trip: Trip }> {
    return this.request<{ trip: Trip }>(`/api/trips/${id}/complete`, {
      method: 'PATCH',
    });
  }

  async cancelTrip(id: string): Promise<{ trip: Trip }> {
    return this.request<{ trip: Trip }>(`/api/trips/${id}/cancel`, {
      method: 'PATCH',
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

  async getMyReservations(): Promise<{ reservations: Reservation[] }> {
    return this.request<{ reservations: Reservation[] }>('/api/reservations/my-reservations');
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
    role: 'PASSENGER' | 'DRIVER';
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

  async checkActiveSessions(): Promise<boolean> {
    const response = await this.request<{ hasActiveSessions: boolean }>('/api/users/me/active-sessions');
    return response.hasActiveSessions;
  }

  async getDriverMetrics(driverId: string): Promise<{ metrics: DriverMetrics }> {
    return this.request<{ metrics: DriverMetrics }>(`/api/users/drivers/${driverId}/metrics`);
  }

  // Reviews
  async createReview(reservationId: string, rating: number, reason?: string, comment?: string): Promise<{ review: any }> {
    return this.request<{ review: any }>('/api/reviews', {
      method: 'POST',
      body: JSON.stringify({ reservationId, rating, reason, comment }),
    });
  }

  async getReviewByReservation(reservationId: string): Promise<{ review: any | null }> {
    return this.request<{ review: any | null }>(`/api/reviews/reservation/${reservationId}`);
  }

  async getDriverReviews(driverId: string): Promise<{ reviews: any[] }> {
    return this.request<{ reviews: any[] }>(`/api/reviews/driver/${driverId}`);
  }

  // Onboarding
  async getOnboardingState(): Promise<{ state: { currentStep: number; onboardingCompletedAt: string | null; pinNudgeCooldownUntil: string | null; notifOptIn: boolean; notifCooldownUntil: string | null } }> {
    return this.request<{ state: any }>('/api/onboarding/state');
  }

  async completeOnboardingStep(step: number, action: 'next' | 'later'): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/api/onboarding/step', {
      method: 'POST',
      body: JSON.stringify({ step, action }),
    });
  }

  async updateNotificationPreferences(notifOptIn: boolean, weeklyDigestOptIn?: boolean): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/api/onboarding/preferences', {
      method: 'POST',
      body: JSON.stringify({ notifOptIn, weeklyDigestOptIn }),
    });
  }

  async getBannerVisibility(type: 'pin' | 'notifications'): Promise<{ shouldShow: boolean }> {
    return this.request<{ shouldShow: boolean }>(`/api/onboarding/banner?type=${type}`);
  }

  async dismissBanner(type: 'pin' | 'notifications'): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/api/onboarding/banner/dismiss', {
      method: 'POST',
      body: JSON.stringify({ type }),
    });
  }

  async updateLastAppOpen(): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/api/onboarding/app-open', {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient(API_URL);
