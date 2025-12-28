import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, RoleLevel } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { user, response } = await requireAuth(RoleLevel.BUSINESS);
    if (response) return response;

    // const user = await prisma.user.findUnique({
    //   where: { email: user.email! },
    //   select: { id: true },
    // // });

    // if (!user) {
    //   return NextResponse.json({ error: "משתמש לא נמצא" }, { status: 404 });
    // }

    const activeGroup = await prisma.activeGroup.findFirst({
      where: {
        id: params.id,
        createdById: user.id, // Ensure user owns this group
      },
      select: {
        id: true,
        title: true,
        description: true,
        participants: {
          select: {
            id: true,
            joinedAt: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
          orderBy: { joinedAt: "desc" },
        },
      },
    });

    if (!activeGroup) {
      return NextResponse.json({ error: "קבוצה לא נמצאה" }, { status: 404 });
    }

    const participants = activeGroup.participants.map((p) => ({
      id: p.id,
      name: p.user.name || "",
      email: p.user.email,
      phone: p.user.phone,
      joinedAt: p.joinedAt.toISOString(),
    }));

    return NextResponse.json({
      participants,
      groupInfo: {
        id: activeGroup.id,
        title: activeGroup.title,
        description: activeGroup.description,
        participantsCount: participants.length,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "שגיאה בשליפת המשתתפים" }, { status: 500 });
  }
}

