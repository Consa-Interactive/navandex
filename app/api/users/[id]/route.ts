import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, User } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function PUT(request: NextRequest) {
  try {
    // Get user ID from URL
    const id = request.nextUrl.pathname.split("/").pop();
    const userId = parseInt(id || "");
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
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

    if (
      !decoded ||
      !decoded.sub ||
      (decoded.role !== "ADMIN" &&
        decoded.role !== "WORKER" &&
        parseInt(decoded.sub) !== userId)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { name, phoneNumber, role, password, address, country, city } = body;

    // Prepare update data
    const updateData: Partial<User> = {};

    // Only add fields that are provided
    if (name !== undefined) updateData.name = name;
    // Prevent phone number updates
    if (decoded.role !== "ADMIN" && phoneNumber !== undefined) {
      return NextResponse.json(
        { error: "Phone number cannot be changed" },
        { status: 400 }
      );
    }
    // Only admin can update phone numbers
    if (decoded.role === "ADMIN" && phoneNumber !== undefined) {
      updateData.phoneNumber = phoneNumber;
    }
    if (role !== undefined) {
      // Validate role if provided
      const validRoles = ["ADMIN", "WORKER", "CUSTOMER"];
      if (!validRoles.includes(role)) {
        return NextResponse.json(
          { error: "Invalid role specified" },
          { status: 400 }
        );
      }
      updateData.role = role;
    }
    if (address !== undefined) updateData.address = address;
    if (country !== undefined) updateData.country = country;
    if (city !== undefined) updateData.city = city;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Check if phone number is already in use by another user if admin is updating it
    if (decoded.role === "ADMIN" && phoneNumber !== undefined) {
      const existingUser = await prisma.user.findFirst({
        where: {
          phoneNumber,
          id: { not: userId },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Phone number already in use" },
          { status: 400 }
        );
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error in PUT /api/users/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// export async function DELETE(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     // Get user ID from URL
//     const id = request.nextUrl.pathname.split("/").pop();
//     const userId = parseInt(id || "");
//     if (isNaN(userId)) {
//       return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
//     }

//     const authHeader = request.headers.get("Authorization");
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return NextResponse.json({ error: "No token provided" }, { status: 401 });
//     }

//     const token = authHeader.split(" ")[1];
//     const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
//       sub: string;
//       role: string;
//     };

//     if (
//       !decoded ||
//       !decoded.sub ||
//       (decoded.role !== "ADMIN" && decoded.role !== "WORKER")
//     ) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
//     }

//     // Check if user exists
//     const user = await prisma.user.findUnique({
//       where: { id: userId },
//     });

//     if (!user) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 });
//     }

//     // Delete user
//     await prisma.user.delete({
//       where: { id: userId },
//     });

//     return NextResponse.json({ message: "User deleted successfully" });
//   } catch (error) {
//     console.error("Error in DELETE /api/users/[id]:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }
