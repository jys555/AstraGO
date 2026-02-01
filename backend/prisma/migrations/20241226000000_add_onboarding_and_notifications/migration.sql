-- Add onboarding and notification fields to User
ALTER TABLE "User" ADD COLUMN "onboardingCompletedAt" TIMESTAMP;
ALTER TABLE "User" ADD COLUMN "pinNudgeCooldownUntil" TIMESTAMP;
ALTER TABLE "User" ADD COLUMN "notifOptIn" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "notifCooldownUntil" TIMESTAMP;
ALTER TABLE "User" ADD COLUMN "weeklyDigestOptIn" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "lastAppOpenAt" TIMESTAMP;
ALTER TABLE "User" ADD COLUMN "lastNotificationSentAt" TIMESTAMP;
ALTER TABLE "User" ADD COLUMN "notificationsSentToday" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "notificationsSentDate" TIMESTAMP;

-- Create NotificationType enum
CREATE TYPE "NotificationType" AS ENUM (
  'DRIVER_REPLIED',
  'RESERVATION_EXPIRING_2MIN',
  'TRIP_CONFIRMED',
  'TRIP_CANCELLED',
  'TRIP_WINDOW_1H',
  'TRIP_WINDOW_15MIN',
  'WEEKLY_TOP_TRIPS'
);

-- Create NotificationLog table
CREATE TABLE "NotificationLog" (
  "id" TEXT NOT NULL,
  "telegramUserId" TEXT NOT NULL,
  "type" "NotificationType" NOT NULL,
  "relatedTripId" TEXT,
  "relatedReservationId" TEXT,
  "sentAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);

-- Create FeatureFlag table
CREATE TABLE "FeatureFlag" (
  "key" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("key")
);

-- Add foreign key for NotificationLog
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_telegramUserId_fkey" 
  FOREIGN KEY ("telegramUserId") REFERENCES "User"("telegramId") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create indexes
CREATE INDEX "NotificationLog_telegramUserId_idx" ON "NotificationLog"("telegramUserId");
CREATE INDEX "NotificationLog_sentAt_idx" ON "NotificationLog"("sentAt");
CREATE INDEX "NotificationLog_type_idx" ON "NotificationLog"("type");

-- Insert default feature flags
INSERT INTO "FeatureFlag" ("key", "enabled") VALUES
  ('FF_PIN_NUDGE_ENABLED', true),
  ('FF_NOTIF_NUDGE_ENABLED', true),
  ('FF_WEEKLY_DIGEST_ENABLED', false),
  ('FF_BANNERS_ENABLED', true)
ON CONFLICT ("key") DO NOTHING;
