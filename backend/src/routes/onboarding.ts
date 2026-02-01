import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getOnboardingStateHandler,
  completeOnboardingStepHandler,
  updateNotificationPreferencesHandler,
  getBannerVisibilityHandler,
  dismissBannerHandler,
  updateLastAppOpenHandler,
} from '../controllers/onboardingController';

const router = Router();

router.use(authenticate);

router.get('/state', getOnboardingStateHandler);
router.post('/step', completeOnboardingStepHandler);
router.post('/preferences', updateNotificationPreferencesHandler);
router.get('/banner', getBannerVisibilityHandler);
router.post('/banner/dismiss', dismissBannerHandler);
router.post('/app-open', updateLastAppOpenHandler);

export default router;
