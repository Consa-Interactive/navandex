import { NextResponse } from "next/server";
import { PrismaClient, Role } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";
    const role = url.searchParams.get("role");
    const page = parseInt(url.searchParams.get("page") || "0");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const skip = page * limit;

    const authHeader = req.headers.get("Authorization");
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

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        sub: string;
        role: string;
      };

      if (!decoded || !decoded.sub) {
        return NextResponse.json(
          { error: "Invalid token" },
          { status: 401 }
        );
      }

      // Only allow admins and workers to access user list
      if (decoded.role !== "ADMIN" && decoded.role !== "WORKER") {
        return NextResponse.json(
          { error: "Unauthorized access" },
          { status: 403 }
        );
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where: {
            role: role ? (role as Role) : undefined,
            ...(search
              ? {
                  OR: [
                    {
                      name: { contains: search, mode: "insensitive" as const },
                    },
                    {
                      phoneNumber: {
                        contains: search,
                        mode: "insensitive" as const,
                      },
                    },
                  ],
                }
              : {}),
          },
          skip,
          take: limit,
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            role: true,
            address: true,
            city: true,
            country: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        }),
        prisma.user.count({
          where: {
            role: role ? (role as Role) : undefined,
            ...(search
              ? {
                  OR: [
                    {
                      name: { contains: search, mode: "insensitive" as const },
                    },
                    {
                      phoneNumber: {
                        contains: search,
                        mode: "insensitive" as const,
                      },
                    },
                  ],
                }
              : {}),
          },
        }),
      ]);

      return NextResponse.json({
        users,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + users.length < total,
      });
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("No token provided in Authorization header");
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        sub: string;
        role: string;
      };

      if (!decoded || !decoded.sub) {
        console.error("Invalid token payload");
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }

      if (decoded.role !== "ADMIN" && decoded.role !== "WORKER") {
        console.error(`Unauthorized access attempt with role: ${decoded.role}`);
        return NextResponse.json(
          { error: "Unauthorized. Only admins and workers can create users." },
          { status: 403 }
        );
      }

      const body = await req.json();
      const { name, phoneNumber, role, password, address, country, city } =
        body;

      // Validate required fields
      if (!name || !phoneNumber || !role || !password) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      // Check if phone number is already in use
      const existingUser = await prisma.user.findFirst({
        where: {
          phoneNumber: phoneNumber,
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Phone number already in use" },
          { status: 400 }
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          name,
          phoneNumber,
          role: role as Role,
          password: hashedPassword,
          address,
          country,
          city,
        },
        select: {
          id: true,
          name: true,
          phoneNumber: true,
          role: true,
          address: true,
          country: true,
          city: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return NextResponse.json(user);
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
  } catch (error) {
    console.error("Error in POST /api/users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
