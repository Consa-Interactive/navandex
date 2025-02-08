import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get invoice ID from URL
    const id = request.nextUrl.pathname.split("/").pop();
    const invoiceId = parseInt(id || "");

    // Verify token
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { error: "JWT secret not configured" },
        { status: 500 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET) as {
        sub: string;
        role: string;
      };
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (!decoded?.sub || !["ADMIN", "WORKER"].includes(decoded.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get invoice with related data
    const invoice = await prisma.invoice.findUnique({
      where: {
        id: invoiceId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            address: true,
          },
        },
        orders: {
          select: {
            id: true,
            title: true,
            size: true,
            color: true,
            quantity: true,
            price: true,
            shippingPrice: true,
            localShippingPrice: true,
            imageUrl: true,
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}
