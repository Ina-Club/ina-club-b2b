import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, RoleLevel } from "@/lib/auth";
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
      },
    });

    if (!activeGroup) {
      return NextResponse.json({ error: "קבוצה לא נמצאה" }, { status: 404 });
    }

    // Fetch user details from the B2C Clerk project
    const b2cClient = createClerkClient({ secretKey: process.env.B2C_CLERK_SECRET_KEY || "" });

    const participants = await Promise.all(activeGroup.participants.map(async (p) => {
      try {
        const clerkUser = await b2cClient.users.getUser(p.userId);
        return {
          id: p.id,
          userId: p.userId,
          name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "משתמש",
          email: clerkUser.emailAddresses[0]?.emailAddress || "",
          phone: clerkUser.phoneNumbers[0]?.phoneNumber || "",
          joinedAt: p.joinedAt.toISOString(),
        };
      } catch (err) {
        return {
          id: p.id,
          userId: p.userId,
          name: "משתמש לא ידוע",
          email: "",
          phone: "",
          joinedAt: p.joinedAt.toISOString(),
        };
      }
    }));

    return NextResponse.json({
      participants,
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
