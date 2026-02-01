import prisma from '../config/database';

const DEFAULT_FLAGS: Record<string, boolean> = {
  FF_PIN_NUDGE_ENABLED: true,
  FF_NOTIF_NUDGE_ENABLED: true,
  FF_WEEKLY_DIGEST_ENABLED: false,
  FF_BANNERS_ENABLED: true,
};

/**
 * Get feature flag value
 */
export async function getFeatureFlag(key: string): Promise<boolean> {
  const flag = await prisma.featureFlag.findUnique({
    where: { key },
  });

  if (flag) {
    return flag.enabled;
  }

  // Return default if not in DB
  return DEFAULT_FLAGS[key] ?? false;
}

/**
 * Get all feature flags
 */
export async function getAllFeatureFlags(): Promise<Record<string, boolean>> {
  const flags = await prisma.featureFlag.findMany();
  const result: Record<string, boolean> = {};

  // Start with defaults
  Object.keys(DEFAULT_FLAGS).forEach((key) => {
    result[key] = DEFAULT_FLAGS[key];
  });

  // Override with DB values
  flags.forEach((flag) => {
    result[flag.key] = flag.enabled;
  });

  return result;
}

/**
 * Set feature flag
 */
export async function setFeatureFlag(key: string, enabled: boolean): Promise<void> {
  await prisma.featureFlag.upsert({
    where: { key },
    create: { key, enabled },
    update: { enabled },
  });
}
