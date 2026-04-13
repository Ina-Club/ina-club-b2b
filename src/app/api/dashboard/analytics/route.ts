import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { RoleLevel } from "@/lib/types/role";
import { GroupStatus } from "@/lib/types/status";

export async function GET(req: Request) {
  try {
    const { user, response } = await requireAuth(RoleLevel.BUSINESS);
    if (response) return response;

    if (!user) {
      return NextResponse.json({ error: "משתמש לא נמצא" }, { status: 404 });
    }

    // Get all active groups with participants
    const activeGroups = await prisma.activeGroup.findMany({
      where: { createdById: user.id },
      include: {
        participants: true,
        category: true,
      },
    });

    // Calculate statistics
    const totalGroups = activeGroups.length;
    const totalParticipants = activeGroups.reduce(
      (sum, group) => sum + group.participants.length,
      0
    );
    const totalRevenue = activeGroups.reduce(
      (sum, group) => sum + group.groupPrice * group.participants.length,
      0
    );
    const openGroups = activeGroups.filter((g) => g.status === GroupStatus.OPEN).length;
    const closedGroups = activeGroups.filter((g) => g.status === GroupStatus.ACTIVATED).length;

    // Group by category
    const categoryStats = activeGroups.reduce((acc, group) => {
      const categoryName = group.category.name;
      if (!acc[categoryName]) {
        acc[categoryName] = {
          category: categoryName,
          groups: 0,
          participants: 0,
          revenue: 0,
        };
      }
      acc[categoryName].groups += 1;
      acc[categoryName].participants += group.participants.length;
      acc[categoryName].revenue += group.groupPrice * group.participants.length;
      return acc;
    }, {} as Record<string, any>);

    // Monthly revenue (last 6 months)
    const monthlyRevenue: Record<string, number> = {};
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    activeGroups.forEach((group) => {
      if (group.createdAt >= sixMonthsAgo) {
        const monthKey = `${group.createdAt.getFullYear()}-${String(group.createdAt.getMonth() + 1).padStart(2, "0")}`;
        if (!monthlyRevenue[monthKey]) {
          monthlyRevenue[monthKey] = 0;
        }
        monthlyRevenue[monthKey] += group.groupPrice * group.participants.length;
      }
    });

    return NextResponse.json({
      summary: {
        totalGroups,
        totalParticipants,
        totalRevenue,
        openGroups,
        closedGroups,
      },
      categoryStats: Object.values(categoryStats),
      monthlyRevenue: Object.entries(monthlyRevenue).map(([month, revenue]) => ({
        month,
        revenue,
      })),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "שגיאה בשליפת הנתונים" },
      { status: 500 }
    );
  }
}
