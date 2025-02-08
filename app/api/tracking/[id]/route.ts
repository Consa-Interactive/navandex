import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verify } from "jsonwebtoken";

const prisma = new PrismaClient();

export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.pathname.split("/").pop();
    const orderId = parseInt(id || "");
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "No authorization token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { error: "Invalid token format" },
        { status: 401 }
      );
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as {
      sub: string;
      role: string;
    };

    if (!decoded || !decoded.sub) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Sadece ADMIN ve WORKER rolündeki kullanıcılar kargo durumunu güncelleyebilir
    if (decoded.role !== "ADMIN" && decoded.role !== "WORKER") {
      return NextResponse.json(
        { error: "Only administrators and workers can update tracking status" },
        { status: 403 }
      );
    }

    // Kargo numarasına göre siparişi bul
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: id,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found with this tracking number" },
        { status: 404 }
      );
    }

    // Siparişin durumunu güncelle
    const updatedOrder = await prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        status: "DELIVERED_TO_WAREHOUSE",
        statusHistory: {
          create: {
            status: "DELIVERED_TO_WAREHOUSE",
            userId: Number(decoded.sub),
            notes: `Order delivered to warehouse with tracking number ${id}`,
          },
        },
      },
      include: {
        user: {
          select: {
            name: true,
            phoneNumber: true,
          },
        },
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Error updating tracking status:", error);
    return NextResponse.json(
      { error: "Failed to update tracking status" },
      { status: 500 }
    );
  }
} 