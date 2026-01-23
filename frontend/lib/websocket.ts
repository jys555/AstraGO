import { io, Socket } from 'socket.io-client';

// Get WebSocket URL from environment variable
// Socket.io automatically handles http -> ws and https -> wss conversion
const getWSURL = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  // Ensure we use http/https, socket.io will handle ws/wss conversion
  return apiUrl.replace(/^ws:/, 'http:').replace(/^wss:/, 'https:');
};

const WS_URL = getWSURL();

class WebSocketClient {
  private socket: Socket | null = null;
  private userId: string | null = null;

  connect(userId: string) {
    if (this.socket?.connected) {
      return;
    }

    this.userId = userId;

    this.socket = io(WS_URL, {
      auth: {
        userId,
      },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  subscribeToTrip(tripId: string, callback: (data: any) => void) {
    if (!this.socket) return;

    this.socket.emit('subscribe:trip', tripId);
    this.socket.on('seat_availability_changed', (data) => {
      if (data.tripId === tripId) {
        callback(data);
      }
    });
    this.socket.on('trip_updated', (data) => {
      if (data.tripId === tripId) {
        callback(data);
      }
    });
  }

  unsubscribeFromTrip(tripId: string) {
    if (!this.socket) return;
    this.socket.emit('unsubscribe:trip', tripId);
  }

  subscribeToReservation(reservationId: string, callback: (data: any) => void) {
    if (!this.socket) return;

    this.socket.emit('subscribe:reservation', reservationId);
    this.socket.on('reservation_created', (data) => {
      if (data.reservationId === reservationId) {
        callback(data);
      }
    });
    this.socket.on('reservation_expired', (data) => {
      if (data.reservationId === reservationId) {
        callback(data);
      }
    });
    this.socket.on('reservation_confirmed', (data) => {
      if (data.reservationId === reservationId) {
        callback(data);
      }
    });
  }

  unsubscribeFromReservation(reservationId: string) {
    if (!this.socket) return;
    this.socket.emit('unsubscribe:reservation', reservationId);
  }

  onDriverStatusChanged(callback: (data: { driverId: string; onlineStatus: boolean }) => void) {
    if (!this.socket) return;
    this.socket.on('driver_status_changed', callback);
  }

  offDriverStatusChanged(callback?: (data: any) => void) {
    if (!this.socket) return;
    this.socket.off('driver_status_changed', callback);
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const wsClient = new WebSocketClient();
