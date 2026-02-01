import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { getIO } from '../index';

// Get all chats for current user (as driver or passenger)
export async function getMyChats(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user;
    const now = new Date();
    const threeDaysAgo = new Date(now);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    // For drivers, only show chats from last 3 days
    // For passengers, show all chats
    const isDriver = user.role === 'DRIVER';
    
    const chats = await prisma.chat.findMany({
      where: {
        OR: [
          { driverId: user.id },
          { passengerId: user.id },
        ],
        // For drivers, only show chats from last 3 days
        ...(isDriver && {
          createdAt: {
            gte: threeDaysAgo,
          },
        }),
      },
      include: {
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            phone: true,
          },
        },
        passenger: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            phone: true,
          },
        },
        trip: {
          select: {
            id: true,
            routeFrom: true,
            routeTo: true,
            departureWindowStart: true,
          },
        },
        reservation: {
          select: {
            id: true,
            status: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    res.json({ chats });
  } catch (error) {
    next(error);
  }
}

// Get chat by ID
export async function getChatById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user;
    const { chatId } = req.params;

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            phone: true,
          },
        },
        passenger: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            phone: true,
          },
        },
        trip: {
          select: {
            id: true,
            routeFrom: true,
            routeTo: true,
            departureWindowStart: true,
          },
        },
      },
    });

    if (!chat) {
      throw new NotFoundError('Chat');
    }

    // Verify user has access to this chat
    if (chat.driverId !== user.id && chat.passengerId !== user.id) {
      throw new ValidationError('Not authorized to access this chat');
    }

    res.json({ chat });
  } catch (error) {
    next(error);
  }
}

// Get messages for a specific chat
export async function getChatMessages(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user;
    const { chatId } = req.params;

    // Verify user has access to this chat
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        driver: true,
        passenger: true,
      },
    });

    if (!chat) {
      throw new NotFoundError('Chat');
    }

    if (chat.driverId !== user.id && chat.passengerId !== user.id) {
      throw new ValidationError('Not authorized to access this chat');
    }

    const messages = await prisma.chatMessage.findMany({
      where: { chatId },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    res.json({ messages });
  } catch (error) {
    next(error);
  }
}

// Send a message in a chat
export async function sendMessage(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user;
    const { chatId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      throw new ValidationError('Message content is required');
    }

    // Verify user has access to this chat
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        driver: true,
        passenger: true,
      },
    });

    if (!chat) {
      throw new NotFoundError('Chat');
    }

    if (chat.driverId !== user.id && chat.passengerId !== user.id) {
      throw new ValidationError('Not authorized to send messages in this chat');
    }

    if (chat.status !== 'ACTIVE') {
      throw new ValidationError('Chat is not active');
    }

    const message = await prisma.chatMessage.create({
      data: {
        chatId,
        senderId: user.id,
        content: content.trim(),
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
          },
        },
      },
    });

    // Update chat's updatedAt
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    // Emit WebSocket event for real-time chat
    const io = getIO();
    if (io) {
      io.to(`chat:${chatId}`).emit('chat_message', {
        chatId,
        message,
      });
    }

    res.status(201).json({ message });
  } catch (error) {
    next(error);
  }
}

// Get or create chat for a reservation
export async function getChatByReservation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user;
    const { reservationId } = req.params;

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        trip: {
          include: {
            driver: true,
          },
        },
        passenger: true,
      },
    });

    if (!reservation) {
      throw new NotFoundError('Reservation');
    }

    // Verify user has access to this reservation
    if (reservation.passengerId !== user.id && reservation.trip.driverId !== user.id) {
      throw new ValidationError('Not authorized to access this reservation');
    }

    // Get or create chat
    let chat = await prisma.chat.findUnique({
      where: { reservationId },
      include: {
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            phone: true,
          },
        },
        passenger: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            phone: true,
          },
        },
      },
    });

    if (!chat) {
      // Create chat if it doesn't exist
      chat = await prisma.chat.create({
        data: {
          reservationId,
          tripId: reservation.tripId,
          driverId: reservation.trip.driverId,
          passengerId: reservation.passengerId,
          status: 'ACTIVE',
        },
        include: {
          driver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              phone: true,
            },
          },
          passenger: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              phone: true,
            },
          },
        },
      });
    }

    res.json({ chat });
  } catch (error) {
    next(error);
  }
}
