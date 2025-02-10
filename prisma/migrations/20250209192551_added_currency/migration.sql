/*
  Warnings:

  - You are about to drop the column `country` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `paidAmount` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `remainingAmount` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[fromCurrency,toCurrency]` on the table `ExchangeRate` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `createdById` to the `ExchangeRate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fromCurrency` to the `ExchangeRate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toCurrency` to the `ExchangeRate` table without a default value. This is not possible if the table is not empty.
  - Made the column `title` on table `Order` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD', 'TRY', 'IQD');

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_orderId_fkey";

-- DropIndex
DROP INDEX "ExchangeRate_createdAt_idx";

-- DropIndex
DROP INDEX "Order_invoiceId_idx";

-- DropIndex
DROP INDEX "Order_status_idx";

-- DropIndex
DROP INDEX "Order_userId_idx";

-- AlterTable
ALTER TABLE "ExchangeRate" ADD COLUMN     "createdById" INTEGER NOT NULL,
ADD COLUMN     "fromCurrency" "Currency" NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "toCurrency" "Currency" NOT NULL,
ADD COLUMN     "updatedById" INTEGER;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "country",
DROP COLUMN "paidAmount",
DROP COLUMN "remainingAmount",
ADD COLUMN     "localShippingCurrency" "Currency" NOT NULL DEFAULT 'USD',
ADD COLUMN     "priceCurrency" "Currency" NOT NULL DEFAULT 'USD',
ADD COLUMN     "shippingCurrency" "Currency" NOT NULL DEFAULT 'USD',
ALTER COLUMN "title" SET NOT NULL;

-- DropTable
DROP TABLE "Payment";

-- CreateIndex
CREATE UNIQUE INDEX "ExchangeRate_fromCurrency_toCurrency_key" ON "ExchangeRate"("fromCurrency", "toCurrency");

-- AddForeignKey
ALTER TABLE "ExchangeRate" ADD CONSTRAINT "ExchangeRate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangeRate" ADD CONSTRAINT "ExchangeRate_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
