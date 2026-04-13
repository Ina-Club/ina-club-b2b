import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { RoleLevel } from "./types/role";

/* ======================
   Role levels
====================== */

// export function roleToLevel(role: Role): RoleLevel {
//   switch (role) {
//     case Role.USER:
//       return RoleLevel.USER;
//     case Role.BUSINESS:
//       return RoleLevel.BUSINESS
//     case Role.ADMIN:
//       return RoleLevel.ADMIN;
//     default:
//       throw new Error(`Unhandled role: ${role}`);
//   }
// }

/* ======================
   Require auth + role
====================== */

export async function requireAuth(minRole: RoleLevel) {
  
  // Role mechanism currently does not do anything.
  // We don't allow users to create accounts for the b2b.
  // Therefore, role validation is not required at the moment.
  // However, I have left the Role logic and param passed to this function for future use. 

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
        response: NextResponse.json({ error: "משתמש לא נמצא" }, { status: 404 }),
      };
    }

    return { 
      user: { 
        id: userId, 
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
      role: clerkUser.publicMetadata.role || RoleLevel.BUSINESS,
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
