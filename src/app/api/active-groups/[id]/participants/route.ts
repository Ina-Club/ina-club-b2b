import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { RoleLevel } from "@/lib/types/role";
import { getB2CUsers } from "@/lib/services/b2c-users";

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
    const participantUserIds = Array.from(new Set([
      ...activeGroup.participants.map(p => p.userId),
      ...activeGroup.tokens.filter(t => t.status === "CONSUMED").map(t => t.userId)
    ]));

    const usersMap = await getB2CUsers(participantUserIds);

    const participants = activeGroup.participants.map((p) => {
      const coupon = activeGroup.coupons.find(c => c.userId === p.userId);
      const userData = usersMap.get(p.userId);
      
      return {
        id: p.id,
        userId: p.userId,
        name: userData?.name || "משתמש לא ידוע",
        email: userData?.email || "",
        joinedAt: p.joinedAt.toISOString(),
        couponCode: coupon?.code || null,
      };
    });

    const activeParticipantIds = new Set(activeGroup.participants.map(p => p.userId));
    
    // Users who have a consumed token but are not active participants
    const exitedTokens = activeGroup.tokens.filter(
      t => t.status === "CONSUMED" && !activeParticipantIds.has(t.userId)
    );

    const exitedUsers = exitedTokens.map((t) => {
      const userData = usersMap.get(t.userId);
      return {
        id: `exited-${t.id}`,
        userId: t.userId,
        name: userData?.name || "משתמש לא ידוע",
        email: userData?.email || "",
        joinedAt: t.consumedAt?.toISOString() || "",
      };
    });

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
