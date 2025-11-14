-- AlterTable
ALTER TABLE "days" ADD COLUMN     "pinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pinnedAt" TIMESTAMP(3),
ADD COLUMN     "pinnedOrder" INTEGER;

-- CreateIndex
CREATE INDEX "days_userId_pinned_idx" ON "days"("userId", "pinned");
