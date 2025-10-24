-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "lockTxHash" TEXT,
ADD COLUMN     "unlockTxHash" TEXT;

-- CreateIndex
CREATE INDEX "Order_expiresAt_idx" ON "Order"("expiresAt");
