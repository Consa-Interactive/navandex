import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : undefined;

    const announcements = await prisma.announcement.findMany({
      where: {
        ...(includeInactive ? {} : { isActive: true }),
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      include: {
        createdBy: {
          select: {
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      ...(limit ? { take: limit } : {}),
    });

    return NextResponse.json(announcements);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Authorization header'ını kontrol et
    const authHeader = request.headers.get("Authorization")?.split(" ")[1];
    
    if (!authHeader) {
      return NextResponse.json(
        { error: "No authorization token provided" },
        { status: 401 }
      );
    }

    try {
      // Token doğrulama
      const decoded = jwt.verify(authHeader, process.env.JWT_SECRET!) as {
        sub: string;
        role: string;
      };

      if (!decoded || !decoded.sub || decoded.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Unauthorized. Only admins can create announcements." },
          { status: 403 }
        );
      }

      const body = await request.json();
      const { title, content, category, isImportant, expiresAt } = body;

      const announcement = await prisma.announcement.create({
        data: {
          title,
          content,
          category,
          isImportant: isImportant || false,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          userId: parseInt(decoded.sub),
        },
        include: {
          createdBy: {
            select: {
              name: true,
              role: true,
            },
          },
        },
      });

      return NextResponse.json(announcement);
    } catch (jwtError) {
      console.error("JWT Verification Error:", jwtError);
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json(
      { error: "Failed to create announcement" },
      { status: 500 }
    );
  }
}
