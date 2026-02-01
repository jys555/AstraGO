-- AlterTable
ALTER TABLE "DriverMetrics" ADD COLUMN "avgRating" DOUBLE PRECISION,
ADD COLUMN "totalReviews" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Trip" ADD COLUMN "durationHours" INTEGER;
