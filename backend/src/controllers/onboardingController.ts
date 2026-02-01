import { Request, Response, NextFunction } from 'express';
import {
  getOnboardingState,
  completeOnboardingStep,
  updateNotificationPreferences,
  shouldShowPinNudge,
  shouldShowNotificationNudge,
  dismissBanner,
} from '../services/onboardingService';
import { updateLastAppOpen } from '../services/notificationService';

/**
 * Get onboarding state
 */
export async function getOnboardingStateHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user;
    const state = await getOnboardingState(user.telegramId);
    res.json({ state });
  } catch (error) {
    next(error);
  }
}

/**
 * Complete onboarding step
 */
export async function completeOnboardingStepHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user;
    const { step, action } = req.body;

    if (!step || !action || !['next', 'later'].includes(action)) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    await completeOnboardingStep(user.telegramId, step, action);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferencesHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user;
    const { notifOptIn, weeklyDigestOptIn } = req.body;

    await updateNotificationPreferences(
      user.telegramId,
      notifOptIn ?? false,
      weeklyDigestOptIn
    );
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

/**
 * Get banner visibility
 */
export async function getBannerVisibilityHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user;
    const { type } = req.query;

    if (type === 'pin') {
      const shouldShow = await shouldShowPinNudge(user.telegramId);
      return res.json({ shouldShow });
    } else if (type === 'notifications') {
      const shouldShow = await shouldShowNotificationNudge(user.telegramId);
      return res.json({ shouldShow });
    }

    res.status(400).json({ error: 'Invalid banner type' });
  } catch (error) {
    next(error);
  }
}

/**
 * Dismiss banner
 */
export async function dismissBannerHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user;
    const { type } = req.body;

    if (!type || !['pin', 'notifications'].includes(type)) {
      return res.status(400).json({ error: 'Invalid banner type' });
    }

    await dismissBanner(user.telegramId, type);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

/**
 * Update last app open
 */
export async function updateLastAppOpenHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user;
    await updateLastAppOpen(user.telegramId);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}
