import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, OrderStatus } from "@prisma/client";
import { verify } from "jsonwebtoken";

const prisma = new PrismaClient();

const DEFAULT_TRACKED_STATUSES: OrderStatus[] = ['RECEIVED_IN_TURKEY', 'PURCHASED', 'DELIVERED_TO_WAREHOUSE'];

export async function GET(request: NextRequest) {
  try {
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
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    // Sadece ADMIN ve WORKER rolündeki kullanıcılar istatistikleri görebilir
    if (decoded.role !== "ADMIN" && decoded.role !== "WORKER") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    // URL'den parametreleri al
    const userId = request.nextUrl.searchParams.get("userId");
    const statusParam = request.nextUrl.searchParams.get("status");
    
    if (!userId || isNaN(Number(userId))) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    // Status parametresi varsa onu kullan, yoksa varsayılan statüleri kullan
    const trackedStatuses = statusParam ? [statusParam as OrderStatus] : DEFAULT_TRACKED_STATUSES;

    // Her durum için sipariş sayılarını al
    const stats = await prisma.order.groupBy({
      by: ['status'],
      _count: true,
      where: {
        userId: Number(userId),
        status: {
          in: trackedStatuses
        }
      }
    });

    // Sonuçları düzenle
    const formattedStats = stats.reduce((acc, curr) => ({
      ...acc,
      [curr.status]: curr._count
    }), Object.fromEntries(trackedStatuses.map(status => [status, 0])) as Record<OrderStatus, number>);

    return NextResponse.json(formattedStats);
  } catch (error) {
    console.error("Error fetching order stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch order statistics" },
      { status: 500 }
    );
  }
} 