import prisma from '../config/database';

export interface OnboardingState {
  currentStep: number;
  onboardingCompletedAt: Date | null;
  pinNudgeCooldownUntil: Date | null;
  notifOptIn: boolean;
  notifCooldownUntil: Date | null;
}

/**
 * Get onboarding state for user
 */
export async function getOnboardingState(telegramUserId: string): Promise<OnboardingState> {
  const user = await prisma.user.findUnique({
    where: { telegramId: telegramUserId },
    select: {
      onboardingCompletedAt: true,
      pinNudgeCooldownUntil: true,
      notifOptIn: true,
      notifCooldownUntil: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Determine current step
  let currentStep = 1;
  if (user.onboardingCompletedAt) {
    currentStep = 4; // done
  } else {
    // Check if user has seen step 1
    // For now, we'll track via step completion
    currentStep = 1;
  }

  return {
    currentStep,
    onboardingCompletedAt: user.onboardingCompletedAt,
    pinNudgeCooldownUntil: user.pinNudgeCooldownUntil,
    notifOptIn: user.notifOptIn,
    notifCooldownUntil: user.notifCooldownUntil,
  };
}

/**
 * Complete onboarding step
 */
export async function completeOnboardingStep(
  telegramUserId: string,
  step: number,
  action: 'next' | 'later'
): Promise<void> {
  const now = new Date();
  const cooldownUntil = new Date(now);
  cooldownUntil.setDate(cooldownUntil.getDate() + 7); // 7 days cooldown

  const updateData: any = {};

  if (action === 'later') {
    if (step === 1) {
      updateData.pinNudgeCooldownUntil = cooldownUntil;
    }
  }

  if (action === 'next') {
    if (step === 2) {
      // User can opt in or out, we'll handle this separately
      // For now, just mark step as seen
    }
    if (step === 3) {
      updateData.onboardingCompletedAt = now;
    }
  }

  await prisma.user.update({
    where: { telegramId: telegramUserId },
    data: updateData,
  });
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
  telegramUserId: string,
  notifOptIn: boolean,
  weeklyDigestOptIn?: boolean
): Promise<void> {
  const updateData: any = {
    notifOptIn,
  };

  if (weeklyDigestOptIn !== undefined) {
    updateData.weeklyDigestOptIn = weeklyDigestOptIn;
  }

  await prisma.user.update({
    where: { telegramId: telegramUserId },
    data: updateData,
  });
}

/**
 * Check if PIN nudge should be shown
 */
export async function shouldShowPinNudge(telegramUserId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { telegramId: telegramUserId },
    select: {
      pinNudgeCooldownUntil: true,
      onboardingCompletedAt: true,
    },
  });

  if (!user) return false;
  if (user.onboardingCompletedAt) return false; // Don't show if onboarding completed
  if (user.pinNudgeCooldownUntil && user.pinNudgeCooldownUntil > new Date()) {
    return false; // Still in cooldown
  }

  return true;
}

/**
 * Check if notification nudge should be shown
 */
export async function shouldShowNotificationNudge(telegramUserId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { telegramId: telegramUserId },
    select: {
      notifOptIn: true,
      notifCooldownUntil: true,
    },
  });

  if (!user) return false;
  if (user.notifOptIn) return false; // Already opted in
  if (user.notifCooldownUntil && user.notifCooldownUntil > new Date()) {
    return false; // Still in cooldown
  }

  // Check if user has active reservations or trips
  const activeReservations = await prisma.reservation.count({
    where: {
      passengerId: user.id,
      status: {
        in: ['PENDING', 'CONFIRMED'],
      },
    },
  });

  const activeTrips = await prisma.trip.count({
    where: {
      driverId: user.id,
      status: 'ACTIVE',
    },
  });

  return activeReservations > 0 || activeTrips > 0;
}

/**
 * Dismiss banner and set cooldown
 */
export async function dismissBanner(
  telegramUserId: string,
  bannerType: 'pin' | 'notifications'
): Promise<void> {
  const now = new Date();
  const cooldownUntil = new Date(now);
  cooldownUntil.setDate(cooldownUntil.getDate() + 7); // 7 days cooldown

  const updateData: any = {};
  if (bannerType === 'pin') {
    updateData.pinNudgeCooldownUntil = cooldownUntil;
  } else if (bannerType === 'notifications') {
    updateData.notifCooldownUntil = cooldownUntil;
  }

  await prisma.user.update({
    where: { telegramId: telegramUserId },
    data: updateData,
  });
}
