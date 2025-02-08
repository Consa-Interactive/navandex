import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as jwt from "jsonwebtoken";

const prisma = new PrismaClient();

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

    const invoices = await prisma.invoice.findMany({
      include: {
        user: true,
        orders: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Failed to fetch invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

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
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: body.invoiceNumber,
        date: body.date,
        dueDate: body.dueDate,
        status: body.status,
        total: body.total,
        paymentMethod: body.paymentMethod,
        notes: body.notes,
        userId: body.userId,
        orders: {
          connect: body.orderIds.map((id: number) => ({ id })),
        },
      },
      include: {
        user: true,
        orders: true,
      },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Failed to create invoice:", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
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
