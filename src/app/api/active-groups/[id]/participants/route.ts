import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { RoleLevel } from "@/lib/types/role";
import { createClerkClient } from "@clerk/nextjs/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, response: authResponse } = await requireAuth(RoleLevel.BUSINESS);
    if (authResponse) return authResponse;
    if (!user) {
      return NextResponse.json({ error: "משתמש לא נמצא" }, { status: 404 });
    }
    const { id } = await params;

    const activeGroup = await prisma.activeGroup.findFirst({
      where: {
        id,
        createdById: user.id, // Ensure user owns this group
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        participants: {
          select: {
            id: true,
            joinedAt: true,
            userId: true,
          },
          orderBy: { joinedAt: "desc" },
        },
        coupons: {
          select: {
            userId: true,
            code: true,
          }
        },
        tokens: {
          select: {
            id: true,
            userId: true,
            status: true,
            consumedAt: true
          }
        }
      },
    });

    if (!activeGroup) {
      return NextResponse.json({ error: "קבוצה לא נמצאה" }, { status: 404 });
    }

    // Fetch user details from the B2C Clerk project
    const b2cClient = createClerkClient({ secretKey: process.env.B2C_CLERK_SECRET_KEY || "" });

    const participants = await Promise.all(activeGroup.participants.map(async (p) => {
      const coupon = activeGroup.coupons.find(c => c.userId === p.userId);
      try {
        const clerkUser = await b2cClient.users.getUser(p.userId);
        return {
          id: p.id,
          userId: p.userId,
          name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "משתמש",
          email: clerkUser.emailAddresses[0]?.emailAddress || "",
          phone: clerkUser.phoneNumbers[0]?.phoneNumber || "",
          joinedAt: p.joinedAt.toISOString(),
          couponCode: coupon?.code || null,
        };
      } catch (err) {
        return {
          id: p.id,
          userId: p.userId,
          name: "משתמש לא ידוע",
          email: "",
          phone: "",
          joinedAt: p.joinedAt.toISOString(),
          couponCode: coupon?.code || null,
        };
      }
    }));

    const activeParticipantIds = new Set(activeGroup.participants.map(p => p.userId));
    
    // Users who have a consumed token but are not active participants
    const exitedTokens = activeGroup.tokens.filter(
      t => t.status === "CONSUMED" && !activeParticipantIds.has(t.userId)
    );

    const exitedUsers = await Promise.all(exitedTokens.map(async (t) => {
      try {
        const clerkUser = await b2cClient.users.getUser(t.userId);
        return {
          id: `exited-${t.id}`,
          userId: t.userId,
          name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "משתמש",
          email: clerkUser.emailAddresses[0]?.emailAddress || "",
          phone: clerkUser.phoneNumbers[0]?.phoneNumber || "",
          joinedAt: t.consumedAt?.toISOString() || "",
        };
      } catch (err) {
        return {
          id: `exited-${t.id}`,
          userId: t.userId,
          name: "משתמש לא ידוע",
          email: "",
          phone: "",
          joinedAt: t.consumedAt?.toISOString() || "",
        };
      }
    }));

    return NextResponse.json({
      participants,
      exitedUsers,
      groupInfo: {
        id: activeGroup.id,
        title: activeGroup.title,
        description: activeGroup.description,
        participantsCount: participants.length,
        status: activeGroup.status,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "שגיאה בשליפת המשתתפים" }, { status: 500 });
  }
}
