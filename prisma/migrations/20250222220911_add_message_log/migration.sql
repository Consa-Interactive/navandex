/*
  Warnings:

  - You are about to drop the column `createdById` on the `ExchangeRate` table. All the data in the column will be lost.
  - You are about to drop the column `fromCurrency` on the `ExchangeRate` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `ExchangeRate` table. All the data in the column will be lost.
  - You are about to drop the column `toCurrency` on the `ExchangeRate` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `ExchangeRate` table. All the data in the column will be lost.
  - You are about to drop the column `localShippingCurrency` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `priceCurrency` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `shippingCurrency` on the `Order` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ExchangeRate" DROP CONSTRAINT "ExchangeRate_createdById_fkey";

-- DropForeignKey
ALTER TABLE "ExchangeRate" DROP CONSTRAINT "ExchangeRate_updatedById_fkey";

-- DropIndex
DROP INDEX "ExchangeRate_fromCurrency_toCurrency_key";

-- AlterTable
ALTER TABLE "ExchangeRate" DROP COLUMN "createdById",
DROP COLUMN "fromCurrency",
DROP COLUMN "isActive",
DROP COLUMN "toCurrency",
DROP COLUMN "updatedById";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "localShippingCurrency",
DROP COLUMN "priceCurrency",
DROP COLUMN "shippingCurrency",
ADD COLUMN     "country" "Country" NOT NULL DEFAULT 'TURKEY',
ALTER COLUMN "title" DROP NOT NULL;

-- DropEnum
DROP TYPE "Currency";

-- CreateTable
CREATE TABLE "MessageLog" (
    "id" SERIAL NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "error" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MessageLog_phoneNumber_idx" ON "MessageLog"("phoneNumber");

-- CreateIndex
CREATE INDEX "MessageLog_timestamp_idx" ON "MessageLog"("timestamp");

-- CreateIndex
CREATE INDEX "MessageLog_success_idx" ON "MessageLog"("success");

-- CreateIndex
CREATE INDEX "ExchangeRate_createdAt_idx" ON "ExchangeRate"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "Order"("userId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_invoiceId_idx" ON "Order"("invoiceId");
