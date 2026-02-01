import prisma from '../config/database';

export enum NotificationType {
  DRIVER_REPLIED = 'DRIVER_REPLIED',
  RESERVATION_EXPIRING_2MIN = 'RESERVATION_EXPIRING_2MIN',
  TRIP_CONFIRMED = 'TRIP_CONFIRMED',
  TRIP_CANCELLED = 'TRIP_CANCELLED',
  TRIP_WINDOW_1H = 'TRIP_WINDOW_1H',
  TRIP_WINDOW_15MIN = 'TRIP_WINDOW_15MIN',
  WEEKLY_TOP_TRIPS = 'WEEKLY_TOP_TRIPS',
}

const NOTIFICATION_TEMPLATES: Record<NotificationType, string> = {
  DRIVER_REPLIED: "Haydovchi javob berdi. Kelishuvni tasdiqlash uchun AstraGo'ga kiring.",
  RESERVATION_EXPIRING_2MIN: "Zaxira tugashiga 2 daqiqa qoldi. Agar ketmoqchi bo'lsangiz, tasdiqlang.",
  TRIP_CONFIRMED: "Reys tasdiqlandi ✅ Tafsilotlar: Reyslarim bo'limida.",
  TRIP_CANCELLED: "Reys bekor qilindi. Xohlasangiz boshqa reys tanlang.",
  TRIP_WINDOW_1H: "Reys oynasiga 1 soat qoldi. Tayyormisiz?",
  TRIP_WINDOW_15MIN: "Reysga 15 daqiqa qoldi. Olish joyini chatda aniqlang.",
  WEEKLY_TOP_TRIPS: "Bu hafta eng mashhur reyslar. Ko'rish uchun AstraGo'ga kiring.",
};

const CRITICAL_EVENTS = [
  NotificationType.RESERVATION_EXPIRING_2MIN,
  NotificationType.TRIP_WINDOW_15MIN,
];

/**
 * Check if notification can be sent (rate limiting)
 */
async function canSendNotification(
  telegramUserId: string,
  type: NotificationType
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { telegramId: telegramUserId },
    select: {
      notifOptIn: true,
      lastNotificationSentAt: true,
      notificationsSentToday: true,
      notificationsSentDate: true,
    },
  });

  if (!user) return false;

  // Reset daily counter if needed
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastSentDate = user.notificationsSentDate
    ? new Date(user.notificationsSentDate)
    : null;

  let notificationsSentToday = user.notificationsSentToday;
  if (!lastSentDate || lastSentDate < today) {
    notificationsSentToday = 0;
    // Reset counter in DB
    await prisma.user.update({
      where: { telegramId: telegramUserId },
      data: {
        notificationsSentToday: 0,
        notificationsSentDate: today,
      },
    });
  }

  // Global limits
  if (notificationsSentToday >= 4) {
    return false; // Max 4 per day
  }

  // Minimum time between non-critical messages
  if (!CRITICAL_EVENTS.includes(type) && user.lastNotificationSentAt) {
    const timeSinceLast = now.getTime() - user.lastNotificationSentAt.getTime();
    const minInterval = 10 * 60 * 1000; // 10 minutes
    if (timeSinceLast < minInterval) {
      return false;
    }
  }

  // Check if user opted in OR if it's a critical event
  if (!user.notifOptIn && !CRITICAL_EVENTS.includes(type)) {
    return false;
  }

  return true;
}

/**
 * Check if notification was already sent for this event
 */
async function wasNotificationSent(
  telegramUserId: string,
  type: NotificationType,
  relatedTripId?: string,
  relatedReservationId?: string
): Promise<boolean> {
  const where: any = {
    telegramUserId,
    type,
  };

  if (relatedTripId) {
    where.relatedTripId = relatedTripId;
  }
  if (relatedReservationId) {
    where.relatedReservationId = relatedReservationId;
  }

  // For expiring reservations, check if sent in last 2 minutes
  if (type === NotificationType.RESERVATION_EXPIRING_2MIN) {
    const twoMinutesAgo = new Date();
    twoMinutesAgo.setMinutes(twoMinutesAgo.getMinutes() - 2);
    where.sentAt = {
      gte: twoMinutesAgo,
    };
  }

  const count = await prisma.notificationLog.count({ where });
  return count > 0;
}

/**
 * Send notification via Telegram Bot API
 */
async function sendTelegramNotification(
  telegramUserId: string,
  message: string
): Promise<void> {
  // TODO: Implement Telegram Bot API integration
  // This would use the Telegram Bot API to send a message to the user
  // For now, we'll just log it
  console.log(`[Notification] To ${telegramUserId}: ${message}`);
  
  // In production, you would do:
  // await telegramBot.sendMessage(telegramUserId, message);
}

/**
 * Send notification
 */
export async function sendNotification(
  telegramUserId: string,
  type: NotificationType,
  relatedTripId?: string,
  relatedReservationId?: string
): Promise<boolean> {
  // Check rate limits
  if (!(await canSendNotification(telegramUserId, type))) {
    return false;
  }

  // Check if already sent (for specific events)
  if (await wasNotificationSent(telegramUserId, type, relatedTripId, relatedReservationId)) {
    return false;
  }

  // Get message template
  const message = NOTIFICATION_TEMPLATES[type];

  // Send notification
  try {
    await sendTelegramNotification(telegramUserId, message);

    // Log notification
    await prisma.notificationLog.create({
      data: {
        telegramUserId,
        type,
        relatedTripId,
        relatedReservationId,
      },
    });

    // Update user stats
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const user = await prisma.user.findUnique({
      where: { telegramId: telegramUserId },
      select: { notificationsSentDate: true, notificationsSentToday: true },
    });

    const lastSentDate = user?.notificationsSentDate
      ? new Date(user.notificationsSentDate)
      : null;
    const isNewDay = !lastSentDate || lastSentDate < today;

    await prisma.user.update({
      where: { telegramId: telegramUserId },
      data: {
        lastNotificationSentAt: now,
        notificationsSentToday: isNewDay ? 1 : (user?.notificationsSentToday || 0) + 1,
        notificationsSentDate: today,
      },
    });

    return true;
  } catch (error) {
    console.error('Failed to send notification:', error);
    return false;
  }
}

/**
 * Update last app open time
 */
export async function updateLastAppOpen(telegramUserId: string): Promise<void> {
  await prisma.user.update({
    where: { telegramId: telegramUserId },
    data: {
      lastAppOpenAt: new Date(),
    },
  });
}
