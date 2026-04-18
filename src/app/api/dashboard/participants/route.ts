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

    // Get all participants from user's active groups
    const activeGroups = await prisma.activeGroup.findMany({
      where: { createdById: user.id },
      include: {
        participants: true,
      },
    });

    // Collect all unique participants
    const participantsMap = new Map();

    activeGroups.forEach((group) => {
      group.participants.forEach((participant) => {
        if (!participantsMap.has(participant.userId)) {
          participantsMap.set(participant.userId, {
            userId: participant.userId,
            name: "משתמש",
            email: "",
            phone: "",
            groups: [],
          });
        }
        participantsMap.get(participant.userId).groups.push({
          groupId: group.id,
          groupTitle: group.title,
          joinedAt: participant.joinedAt.toISOString(),
        });
      });
    });

    const participants = Array.from(participantsMap.values());

    return NextResponse.json({ participants });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "שגיאה בשליפת המשתתפים" },
      { status: 500 }
    );
  }
}

