import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, RoleLevel } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { user, response } = await requireAuth(RoleLevel.BUSINESS);
    if (response) return response;

    if (!user) {
      return NextResponse.json({ error: "משתמש לא נמצא" }, { status: 404 });
    }

    // Get user's company and its categories
    const userWithCompany = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        company: {
          include: {
            categories: true,
          },
        },
      },
    });

    if (!userWithCompany?.company) {
      return NextResponse.json({ requestGroups: [] });
    }

    const companyCategories = userWithCompany.company.categories.map((c) => c.id);

    if (companyCategories.length === 0) {
      return NextResponse.json({ requestGroups: [] });
    }

    // Get relevant request groups based on company categories
    const requestGroups = await prisma.requestGroup.findMany({
      where: {
        categoryId: {
          in: companyCategories,
        },
        status: "OPEN",
      },
      include: {
        category: true,
        participants: {
          select: {
            id: true,
          },
        },
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const data = requestGroups.map((group) => ({
      id: group.id,
      title: group.title,
      description: group.description,
      category: group.category.name,
      categoryId: group.categoryId,
      participantsCount: group.participants.length,
      createdAt: group.createdAt.toISOString(),
      createdBy: group.createdBy,
    }));

    return NextResponse.json({ requestGroups: data });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "שגיאה בשליפת הבקשות" },
      { status: 500 }
    );
  }
}

