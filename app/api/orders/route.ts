import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import scrapeProductPage from "@/lib/scraper";

const prisma = new PrismaClient();

// GET /api/orders - Get all orders
export async function GET(req: Request) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.get("Authorization");
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

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      sub: string;
      role: string;
    };

    if (!decoded || !decoded.sub) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get orders based on user role and ID
    const orders = await prisma.order.findMany({
      where: {
        userId: decoded.role === "CUSTOMER" ? parseInt(decoded.sub) : undefined,
      },
      include: {
        user: {
          select: {
            name: true,
            phoneNumber: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create a new order
export async function POST(request: Request) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      sub: string;
      role: string;
    };

    if (!decoded || !decoded.sub) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();

    // Determine the userId for the order
    let userId: number;
    if (["ADMIN", "WORKER"].includes(decoded.role) && body.userId) {
      // Admins/Workers can create orders for other users
      userId = Number(body.userId);
    } else {
      // Customers can only create orders for themselves
      userId = parseInt(decoded.sub);
    }

    // Initialize default values
    let scrapedTitle: string | undefined;
    let scrapedImage: string | undefined;

    // Try to scrape product data if link is provided
    try {
      if (body.productLink) {
        const scraperData = await scrapeProductPage(body.productLink);
        scrapedTitle = scraperData.title;
        scrapedImage = scraperData.image;
      }
    } catch (error) {
      console.error("Error scraping product:", error);
      // Continue with undefined scraper data
    }
    
    // Get total order count for default title
    const totalOrders = await prisma.order.count();

    // Ensure we have valid values for title and image
    const title = body.title || scrapedTitle || `Order-${totalOrders + 1}`;
    const imageUrl = body.imageUrl || scrapedImage || "/logo.png";

    const order = await prisma.order.create({
      data: {
        title,
        size: body.size || "N/A",
        color: body.color || "N/A",
        quantity: Number(body.quantity) || 1,
        price: 0,
        shippingPrice: Number(body.shippingPrice) || 0,
        localShippingPrice: Number(body.localShippingPrice) || 0,
        status: "PENDING",
        productLink: body.productLink || "",
        imageUrl,
        notes: body.notes || "",
        userId: userId,
      },
      include: {
        user: true,
      },
    });
    await prisma.orderStatusHistory.create({
      data: {
        status: "PENDING",
        orderId: order.id,
        userId: Number(decoded.sub),
        notes: "Order created",
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
