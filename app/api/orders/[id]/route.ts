import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verify } from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";
import { sendWhatsAppMessage } from "@/lib/services/whatsapp";

const prisma = new PrismaClient();

export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.pathname.split("/").pop()?.trim() || "";
    const orderId = parseInt(id);
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

    const decoded = verify(token, process.env.JWT_SECRET!) as JwtPayload & {
      role: string;
    };
    if (!decoded || !decoded.sub) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const {
      status,
      price,
      shippingPrice,
      localShippingPrice,
      orderNumber,
      prepaid,
      quantity,
      title,
      size,
      color,
      notes,
      productLink,
      imageUrl,
      iqdPrice,
      iqdShippingPrice,
    } = body;

    // Admin/Worker kontrolü gereken statüler
    const adminOnlyStatuses = [
      "PURCHASED",
      "RECEIVED_IN_TURKEY",
      "DELIVERED_TO_WAREHOUSE",
    ];
    if (
      adminOnlyStatuses.includes(status) &&
      decoded.role !== "ADMIN" &&
      decoded.role !== "WORKER"
    ) {
      return NextResponse.json(
        { error: "Only administrators and workers can perform this action" },
        { status: 403 }
      );
    }

    // Sipariş sahibi veya admin/worker kontrolü
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        userId: true,
        user: {
          select: {
            phoneNumber: true,
            name: true,
          },
        },
        title: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Eğer kullanıcı admin/worker değilse ve siparişin sahibi de değilse
    if (
      decoded.role !== "ADMIN" &&
      decoded.role !== "WORKER" &&
      order.userId !== parseInt(decoded.sub)
    ) {
      return NextResponse.json(
        { error: "You can only update your own orders" },
        { status: 403 }
      );
    }

    // If updating to PURCHASED status, orderNumber is required
    if (status === "PURCHASED" && !orderNumber) {
      return NextResponse.json(
        { error: "Order number is required when marking as purchased" },
        { status: 400 }
      );
    }

    const updatedOrder = await prisma.order.update({
      where: {
        id: Number(orderId),
      },
      data: {
        ...(status && { status }),
        ...(price !== undefined && { price: Number(price) }),
        ...(shippingPrice !== undefined && {
          shippingPrice: Number(shippingPrice),
        }),
        ...(iqdPrice !== undefined && { iqdPrice: Number(iqdPrice) }),
        ...(iqdShippingPrice !== undefined && {
          iqdShippingPrice: Number(iqdShippingPrice),
        }),
        ...(localShippingPrice !== undefined && {
          localShippingPrice: Number(localShippingPrice),
        }),
        ...(orderNumber && { orderNumber }),
        ...(prepaid !== undefined && { prepaid }),
        ...(quantity !== undefined && { quantity: Number(quantity) }),
        ...(title !== undefined && { title }),
        ...(size !== undefined && { size }),
        ...(color !== undefined && { color }),
        ...(notes !== undefined && { notes }),
        ...(productLink !== undefined && { productLink }),
        ...(imageUrl !== undefined && { imageUrl }),
        statusHistory: {
          create: {
            status: status || "PENDING",
            userId: Number(decoded.sub),
            notes: `Order ${
              status ? `status updated to ${status}` : "updated"
            }${orderNumber ? ` with order number ${orderNumber}` : ""}${
              prepaid !== undefined
                ? ` and marked as ${prepaid ? "prepaid" : "not prepaid"}`
                : ""
            }`,
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

    // WhatsApp bildirimi gönderme
    if (status) {
      const notificationStatuses = [
        "CANCELLED",
        "PROCESSING",
        "DELIVERED_TO_WAREHOUSE",
      ];

      if (notificationStatuses.includes(status)) {
        try {
          await sendWhatsAppMessage(orderId);
        } catch (error) {
          console.error("Error sending WhatsApp notification:", error);
        }
      }
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.pathname.split("/").pop()?.trim() || "";
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
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

    const order = await prisma.order.findUnique({
      where: {
        id: Number(id),
        ...(decoded.role === "CUSTOMER"
          ? { userId: parseInt(decoded.sub) }
          : {}),
      },
      include: {
        user: {
          select: {
            name: true,
            phoneNumber: true,
          },
        },
        statusHistory: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
