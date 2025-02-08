import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      sub: string;
      role: string;
    };

    if (!decoded || !decoded.sub) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = parseInt(decoded.sub);

    // Get all orders for the user
    const allOrders = await prisma.order.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        status: true,
        price: true,
        quantity: true,
        createdAt: true,
      },
    });

    // Get recent orders (last 3) for display
    const recentOrders = allOrders
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 3);

    // Get user statistics
    const [totalOrders, deliveredOrders, savedAddresses] = await Promise.all([
      prisma.order.count({
        where: { userId },
      }),
      prisma.order.count({
        where: {
          userId,
          status: "DELIVERED",
        },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          address: true,
          city: true,
          country: true,
          phoneNumber: true,
          createdAt: true,
          role: true,
          isActive: true,
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalOrders,
        deliveredOrders,
        savedAddresses: savedAddresses?.address ? 1 : 0,
        wishlistItems: 0, // Future implementation
      },
      userInfo: savedAddresses,
      recentOrders: recentOrders.map((order) => ({
        ...order,
        total: order.price * order.quantity,
        items: order.quantity,
      })),
      allOrders: allOrders.map((order) => ({
        ...order,
        total: order.price * order.quantity,
        items: order.quantity,
      })),
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch user statistics" },
      { status: 500 }
    );
  }
}
