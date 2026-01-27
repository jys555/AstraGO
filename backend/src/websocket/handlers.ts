import { Server as SocketIOServer } from 'socket.io';
import prisma from '../config/database';
import { expireOldReservations } from '../services/reservationService';

export function setupWebSocketHandlers(io: SocketIOServer) {
  io.use(async (socket, next) => {
    // Simple authentication - in production, validate Telegram initData
    const userId = socket.handshake.auth.userId;
    if (!userId) {
      return next(new Error('Authentication required'));
    }
    (socket as any).userId = userId;
    next();
  });

  io.on('connection', (socket) => {
    const userId = (socket as any).userId;
    console.log(`User ${userId} connected`);

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Subscribe to trip updates
    socket.on('subscribe:trip', async (tripId: string) => {
      socket.join(`trip:${tripId}`);
      console.log(`User ${userId} subscribed to trip ${tripId}`);
    });

    // Unsubscribe from trip updates
    socket.on('unsubscribe:trip', (tripId: string) => {
      socket.leave(`trip:${tripId}`);
      console.log(`User ${userId} unsubscribed from trip ${tripId}`);
    });

    // Subscribe to reservation updates
    socket.on('subscribe:reservation', (reservationId: string) => {
      socket.join(`reservation:${reservationId}`);
      console.log(`User ${userId} subscribed to reservation ${reservationId}`);
    });

    // Unsubscribe from reservation updates
    socket.on('unsubscribe:reservation', (reservationId: string) => {
      socket.leave(`reservation:${reservationId}`);
      console.log(`User ${userId} unsubscribed from reservation ${reservationId}`);
    });

    // Subscribe to chat updates
    socket.on('subscribe:chat', (chatId: string) => {
      socket.join(`chat:${chatId}`);
      console.log(`User ${userId} subscribed to chat ${chatId}`);
    });

    // Unsubscribe from chat updates
    socket.on('unsubscribe:chat', (chatId: string) => {
      socket.leave(`chat:${chatId}`);
      console.log(`User ${userId} unsubscribed from chat ${chatId}`);
    });

    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected`);
    });
  });

  // Periodic task to expire old reservations
  setInterval(async () => {
    try {
      const expiredCount = await expireOldReservations();
      if (expiredCount > 0) {
        console.log(`Expired ${expiredCount} reservations`);
      }
    } catch (error) {
      console.error('Error expiring reservations:', error);
    }
  }, 60000); // Check every minute
}

// Helper functions to emit events
export function emitSeatAvailabilityChanged(
  io: SocketIOServer,
  tripId: string,
  data: { availableSeats: number; reservedSeats: number }
) {
  io.to(`trip:${tripId}`).emit('seat_availability_changed', {
    tripId,
    ...data,
  });
}

export function emitReservationCreated(
  io: SocketIOServer,
  reservationId: string,
  driverId: string,
  data: any
) {
  io.to(`user:${driverId}`).emit('reservation_created', {
    reservationId,
    ...data,
  });
  io.to(`reservation:${reservationId}`).emit('reservation_created', {
    reservationId,
    ...data,
  });
}

export function emitReservationExpired(
  io: SocketIOServer,
  reservationId: string,
  data: any
) {
  io.to(`reservation:${reservationId}`).emit('reservation_expired', {
    reservationId,
    ...data,
  });
}

export function emitReservationConfirmed(
  io: SocketIOServer,
  reservationId: string,
  data: any
) {
  io.to(`reservation:${reservationId}`).emit('reservation_confirmed', {
    reservationId,
    ...data,
  });
}

export function emitDriverStatusChanged(
  io: SocketIOServer,
  driverId: string,
  onlineStatus: boolean
) {
  // Notify all trips by this driver
  io.emit('driver_status_changed', {
    driverId,
    onlineStatus,
  });
}

export function emitTripUpdated(
  io: SocketIOServer,
  tripId: string,
  data: any
) {
  io.to(`trip:${tripId}`).emit('trip_updated', {
    tripId,
    ...data,
  });
}

export function emitChatMessage(
  io: SocketIOServer,
  chatId: string,
  message: any
) {
  io.to(`chat:${chatId}`).emit('chat_message', {
    chatId,
    message,
  });
}
