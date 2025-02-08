import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { orderIds, paymentMethod, notes, dueDate } = await request.json();

    // Fetch the selected orders with user data
    const orders = await prisma.order.findMany({
      where: {
        id: {
          in: orderIds,
        },
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
      },
    });

    if (!orders.length) {
      return NextResponse.json({ error: "No orders found" }, { status: 404 });
    }

    if (!orders[0].user) {
      return NextResponse.json(
        { error: "User information not found" },
        { status: 400 }
      );
    }

    // Calculate total from orders
    const total = orders.reduce(
      (sum, order) =>
        sum +
        order.price * order.quantity +
        order.shippingPrice * order.quantity +
        order.localShippingPrice * order.quantity,
      0
    );

    // Generate invoice number with timestamp to ensure uniqueness
    const now = new Date();
    const timestamp = now.getTime().toString().slice(-6);
    const invoiceNumber = `INV-${now.getFullYear()}${String(
      now.getMonth() + 1
    ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${timestamp}`;

    // Create invoice and link orders
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        date: now,
        dueDate: new Date(dueDate),
        status: "PENDING",
        total,
        paymentMethod,
        notes,
        userId: orders[0].user.id,
        orders: {
          connect: orderIds.map((id: number) => ({ id })),
        },
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
          include: {
            user: {
              select: {
                name: true,
                phoneNumber: true,
                address: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Failed to generate invoice:", error);
    return NextResponse.json(
      { error: "Failed to generate invoice" },
      { status: 500 }
    );
  }
}
