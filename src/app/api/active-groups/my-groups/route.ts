import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { RoleLevel } from "@/lib/types/role";

export async function GET(req: Request) {
  try {
    const { user, response } = await requireAuth(RoleLevel.BUSINESS);
    if (response) return response;

    if (!user) {
      return NextResponse.json({ error: "משתמש לא נמצא" }, { status: 404 });
    }

    const activeGroups = await prisma.activeGroup.findMany({
      where: { createdById: user!.id },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        category: { select: { name: true } },
        basePrice: true,
        groupPrice: true,
        deadline: true,
        minParticipants: true,
        maxParticipants: true,
        participants: {
          select: {
            id: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = activeGroups.map((group) => ({
      id: group.id,
      title: group.title,
      description: group.description,
      status: group.status,
      category: group.category?.name ?? "",
      basePrice: group.basePrice,
      groupPrice: group.groupPrice,
      deadline: group.deadline.toISOString(),
      participantsCount: group.participants.length,
      minParticipants: group.minParticipants,
      maxParticipants: group.maxParticipants,
    }));

    return NextResponse.json({ activeGroups: data });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "שגיאה בשליפת הקבוצות" }, { status: 500 });
  }
}
