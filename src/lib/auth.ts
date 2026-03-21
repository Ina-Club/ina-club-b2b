import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { auth, currentUser } from "@clerk/nextjs/server";

/* ======================
   Role levels
====================== */

export enum RoleLevel {
  USER = 0,
  BUSINESS = 1,
  ADMIN = 2,
}

export function roleToLevel(role: Role): RoleLevel {
  switch (role) {
    case Role.USER:
      return RoleLevel.USER;
    case Role.BUSINESS:
      return RoleLevel.BUSINESS
    case Role.ADMIN:
      return RoleLevel.ADMIN;
    default:
      throw new Error(`Unhandled role: ${role}`);
  }
}

/* ======================
   Require auth + role
====================== */

export async function requireAuth(minRole: RoleLevel) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        user: null,
        response: NextResponse.json({ error: "לא מורשה" }, { status: 401 }),
      };
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return {
        user: null,
        response: NextResponse.json({ error: "משתמש לא נמצא ב-Clerk" }, { status: 404 }),
      };
    }

    // Since we don't have a User table anymore, we might need to store roles in Clerk metadata.
    // For now, we'll assume BUSINESS role if they are signed into B2B.
    // Or we can check if they have a B2B package.
    const b2bPackage = await prisma.b2BPackage.findUnique({
      where: { userId },
    });

    const userRole = (clerkUser.publicMetadata.role as Role) || Role.BUSINESS;

    if (roleToLevel(userRole) < minRole) {
      return {
        user: null,
        response: NextResponse.json({ error: "אין הרשאה" }, { status: 403 }),
      };
    }

    return { 
      user: { 
        id: userId, 
        role: userRole, 
        email: clerkUser.emailAddresses[0]?.emailAddress,
        name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || clerkUser.username
      }, 
      response: null 
    };
  } catch (error: any) {
    console.error("Error in requireAuth:", error);
    return {
      user: null,
      response: NextResponse.json(
        { error: "שגיאה באימות" },
        { status: 500 }
      ),
    };
  }
}

/* ======================
   Get current user
====================== */

export async function getCurrentUser() {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    // Get B2B-specific data using clerk userId
    const b2bPackage = await prisma.b2BPackage.findUnique({
      where: { userId },
      include: {
        payments: true,
      },
    });

    const company = await prisma.company.findUnique({
      where: { ownerId: userId },
      include: {
        categories: true,
        logo: true,
      },
    });

    return {
      id: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress,
      name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || clerkUser.username,
      profilePicture: clerkUser.imageUrl,
      role: (clerkUser.publicMetadata.role as Role) || Role.BUSINESS,
      b2bPackage,
      company,
    };
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return null;
  }
}

/* ======================
   Utility
====================== */

export async function getUserIdByEmail(email: string) {
  // This is tricky without a local User table. 
  // We'd need to search Clerk users.
  return null;
}
