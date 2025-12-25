import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { auth, clerkClient } from "@clerk/nextjs/server";

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
      return RoleLevel.BUSINESS;
    case Role.ADMIN:
      return RoleLevel.ADMIN;
    default:
      throw new Error(`Unhandled role: ${role}`);
  }
}

/* ======================
   Helper: Sync user from Clerk to DB
====================== */

async function syncUserFromClerk(clerkUserId: string) {
  try {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(clerkUserId);

    // Get email - try primary first, then first available
    let email: string | undefined;
    if (clerkUser.primaryEmailAddressId) {
      email = clerkUser.emailAddresses.find(
        (e: { id: string; emailAddress: string }) => e.id === clerkUser.primaryEmailAddressId
      )?.emailAddress;
    }
    
    if (!email && clerkUser.emailAddresses.length > 0) {
      email = clerkUser.emailAddresses[0].emailAddress;
    }

    if (!email) {
      throw new Error("No email found in Clerk user");
    }

    // Get name from Clerk
    const name = clerkUser.firstName 
      ? `${clerkUser.firstName}${clerkUser.lastName ? ` ${clerkUser.lastName}` : ""}`.trim()
      : clerkUser.username || null;

    // Get phone from Clerk
    const phone = clerkUser.phoneNumbers.find(
      (p: { id: string; phoneNumber: string }) => p.id === clerkUser.primaryPhoneNumberId
    )?.phoneNumber || 
    (clerkUser.phoneNumbers.length > 0 ? clerkUser.phoneNumbers[0].phoneNumber : null);

    // Find or create/update user in DB
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Update existing user with latest data from Clerk
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: name || existingUser.name,
          phone: phone || existingUser.phone,
          emailVerified: clerkUser.emailAddresses.some((e) => e.verification?.status === "verified") 
            ? new Date() 
            : existingUser.emailVerified,
        },
        select: { id: true, role: true, email: true },
      });
      return updatedUser;
    } else {
      // Create new user
      const newUser = await prisma.user.create({
        data: {
          email,
          name,
          phone,
          emailVerified: clerkUser.emailAddresses.some((e) => e.verification?.status === "verified")
            ? new Date()
            : null,
          role: Role.BUSINESS, // default B2B role
        },
        select: { id: true, role: true, email: true },
      });
      return newUser;
    }
  } catch (error) {
    console.error("Error syncing user from Clerk:", error);
    throw error;
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

    // Sync user from Clerk to DB
    const user = await syncUserFromClerk(userId);

    // Role check
    if (roleToLevel(user.role) < minRole) {
      return {
        user: null,
        response: NextResponse.json({ error: "אין הרשאה" }, { status: 403 }),
      };
    }

    return { user, response: null };
  } catch (error: any) {
    console.error("Error in requireAuth:", error);
    return {
      user: null,
      response: NextResponse.json(
        { error: error.message || "שגיאה באימות" },
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

    // Sync user from Clerk to DB
    const syncedUser = await syncUserFromClerk(userId);

    // Get full user with relations
    const user = await prisma.user.findUnique({
      where: { id: syncedUser.id },
      include: {
        b2bPackage: true,
      },
    });

    if (!user) return null;

    // Get company separately if exists
    // Using raw query to get companyId until Prisma client is regenerated
    const userWithCompanyId = await prisma.$queryRaw<Array<{ companyId: string | null }>>`
      SELECT "companyId" FROM "User" WHERE id = ${user.id}
    `;
    const companyId = userWithCompanyId[0]?.companyId;

    let company = null;
    if (companyId) {
      company = await prisma.company.findUnique({
        where: { id: companyId },
        include: {
          categories: true,
          logo: true,
        },
      });
    }

    return { ...user, company };
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return null;
  }
}

/* ======================
   Utility
====================== */

export async function getUserIdByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  return user?.id ?? null;
}
