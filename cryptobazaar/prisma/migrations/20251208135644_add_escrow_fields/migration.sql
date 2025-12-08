/*
  Warnings:

  - You are about to drop the column `lockTxHash` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `unlockTxHash` on the `Order` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[orderId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'EXPIRED';

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "lockTxHash",
DROP COLUMN "unlockTxHash",
ADD COLUMN     "buyerAddress" TEXT,
ADD COLUMN     "cancelTxHash" TEXT,
ADD COLUMN     "escrowTxHash" TEXT,
ADD COLUMN     "orderId" INTEGER,
ADD COLUMN     "releaseTxHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderId_key" ON "Order"("orderId");

-- CreateIndex
CREATE INDEX "Order_orderId_idx" ON "Order"("orderId");
