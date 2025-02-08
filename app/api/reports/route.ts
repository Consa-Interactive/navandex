import { NextResponse } from "next/server";
import { PrismaClient, OrderStatus } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// Helper function to verify admin token
async function verifyAdminToken(authHeader: string | null) {
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

    if (decoded.role !== "ADMIN") {
      return {
        error: "Unauthorized. Only admins can access reports.",
        status: 403,
      };
    }

    return { userId: parseInt(decoded.sub), error: null };
  } catch {
    return { error: "Invalid token", status: 401 };
  }
}

export async function GET(req: Request) {
  try {
    // Verify admin token
    const authResult = await verifyAdminToken(req.headers.get("Authorization"));
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const url = new URL(req.url);
    const startDate = url.searchParams.get("startDate") || new Date(0).toISOString();
    const endDate = url.searchParams.get("endDate") || new Date().toISOString();
    const status = url.searchParams.get("status") as OrderStatus | null;

    // Prepare the filters
    const filters = {
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
      ...(status && { status: status as OrderStatus }),
    };

    // Get orders count and financial data
    const [orders, financialData, ordersByStatus, orderTrends] = await Promise.all([
      // Orders count
      prisma.order.count({
        where: filters,
      }),

      // Financial totals
      prisma.order.aggregate({
        where: filters,
        _sum: {
          price: true,
          shippingPrice: true,
          localShippingPrice: true,
        },
      }),

      // Orders grouped by status
      prisma.order.groupBy({
        by: ['status'],
        where: {
          createdAt: filters.createdAt,
          ...(status && { status: status as OrderStatus })
        },
        _count: true,
      }),

      // Order trends by month
      prisma.order.groupBy({
        by: ['status', 'createdAt'],
        where: filters,
        _count: true,
        orderBy: {
          createdAt: 'asc',
        },
      })
    ]);

    // Process order trends data
    const trendsByMonth = new Map();
    orderTrends.forEach((trend) => {
      const date = new Date(trend.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthData = trendsByMonth.get(monthKey) || {
        month: new Date(date.getFullYear(), date.getMonth(), 1).toLocaleDateString('en-US', { month: 'short' }),
        total: 0,
        cancelled: 0,
        completed: 0,
        processing: 0
      };

      if (trend.status === 'CANCELLED') {
        monthData.cancelled = trend._count;
      } else if (['DELIVERED', 'COMPLETED'].includes(trend.status)) {
        monthData.completed = (monthData.completed || 0) + trend._count;
      } else if (['PENDING', 'PROCESSING', 'CONFIRMED', 'PURCHASED', 'SHIPPED', 'RECEIVED_IN_TURKEY', 'DELIVERED_TO_WAREHOUSE'].includes(trend.status)) {
        monthData.processing = (monthData.processing || 0) + trend._count;
      }

      monthData.total += trend._count;
      trendsByMonth.set(monthKey, monthData);
    });

    // Convert trends map to array and sort by date
    const trendsData = Array.from(trendsByMonth.values());

    // Sonuçları düzenle
    const formattedStats = status 
      ? { [status]: ordersByStatus[0]?._count || 0 }
      : ordersByStatus.reduce((acc, curr) => ({
          ...acc,
          [curr.status]: curr._count
        }), {});

    return NextResponse.json({
      orders: {
        totalOrders: orders,
        byStatus: formattedStats,
        trends: trendsData
      },
      financial: {
        totalRevenue: Number(financialData._sum?.price) || 0,
        shippingCosts: {
          shippingPrice: Number(financialData._sum?.shippingPrice) || 0,
          localShippingPrice: Number(financialData._sum?.localShippingPrice) || 0,
        },
      },
    });
  } catch (error) {
    console.error("Error generating reports:", error);
    return NextResponse.json(
      { error: "Failed to generate reports" },
      { status: 500 }
    );
  }
}
