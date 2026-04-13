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

    // Get user's company and its categories
    const company = await prisma.company.findFirst({
      where: { ownerId: user.id },
      select: {
        id: true,
        categories: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json({ wishItems: [] });
    }

    const companyCategories = company.categories.map((c) => c.id);

    if (companyCategories.length === 0) {
      return NextResponse.json({ wishItems: [] });
    }

    // Get relevant wish items based on company categories
    const wishItems = await prisma.wishItem.findMany({
      where: {
        categoryId: {
          in: companyCategories,
        },
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const data = wishItems.map((item) => {
      return {
        id: item.id,
        title: item.text,
        description: `מחיר יעד: ₪${item.targetPrice || 'לא צוין'}`,
        category: item.category?.name || "ללא קטגוריה",
        categoryId: item.categoryId,
        participantsCount: 0, // In a real app, you'd fetch like count here
        createdAt: item.createdAt.toISOString(),
        createdById: item.createdById,
      };
    });

    return NextResponse.json({ wishItems: data });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "שגיאה בשליפת הבקשות" },
      { status: 500 }
    );
  }
}
