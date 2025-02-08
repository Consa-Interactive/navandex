-- CreateEnum
CREATE TYPE "Country" AS ENUM ('TURKEY', 'USA', 'UK', 'UAE', 'EUROPE', 'OTHER');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "country" "Country" NOT NULL DEFAULT 'TURKEY';
