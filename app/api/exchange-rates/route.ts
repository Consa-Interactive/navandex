import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// Get exchange rates
export async function GET(request: Request) {
  try {
    const token = request.headers.get("Authorization");
    const authResult = await verifyAdminToken(token!);

    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const rates = await prisma.exchangeRate.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    // Return empty array instead of 404 when no rates found
    return NextResponse.json(rates);
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    return NextResponse.json(
      { error: "Failed to fetch exchange rates" },
      { status: 500 }
    );
  }
}

async function verifyAdminToken(authHeader: string) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "No token provided", status: 401 };
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return { error: "Invalid token format", status: 401 };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      sub: string;
      role: string;
    };

    if (!decoded || !decoded.sub) {
      return { error: "Invalid token", status: 401 };
    }

    if (!["ADMIN", "WORKER"].includes(decoded.role)) {
      return {
        error:
          "Unauthorized. Only admins and workers can access exchange rates.",
        status: 403,
      };
    }

    return { userId: parseInt(decoded.sub), error: null };
  } catch {
    return { error: "Invalid token", status: 401 };
  }
}

// Create new exchange rate
export async function POST(request: Request) {
  try {
    const token = request.headers.get("Authorization");
    const authResult = await verifyAdminToken(token!);

    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const body = await request.json();
    const { rate } = body;

    if (!rate || typeof rate !== "number" || rate <= 0) {
      return NextResponse.json(
        { error: "Invalid rate provided" },
        { status: 400 }
      );
    }

    const newRate = await prisma.exchangeRate.create({
      data: {
        rate,
      },
    });

    return NextResponse.json(newRate);
  } catch (error) {
    console.error("Error creating exchange rate:", error);
    return NextResponse.json(
      { error: "Failed to create exchange rate" },
      { status: 500 }
    );
  }
}
