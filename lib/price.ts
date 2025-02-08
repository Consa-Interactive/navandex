import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export async function getLatestExchangeRate(): Promise<number> {
  const rate = await prisma.exchangeRate.findFirst({
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!rate) {
    throw new Error("No exchange rate found");
  }

  return rate.rate;
}

export async function convertTRYtoUSD(tryAmount: number): Promise<number> {
  const rate = await getLatestExchangeRate();
  return Number((tryAmount / rate).toFixed(2));
}

export async function convertUSDtoTRY(usdAmount: number): Promise<number> {
  const rate = await getLatestExchangeRate();
  return Number((usdAmount * rate).toFixed(2));
}

export function formatPrice(amount: number, currency: "USD" | "TRY"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
