import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, RoleLevel } from "@/lib/auth";
import { GroupStatus } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { user, response } = await requireAuth(RoleLevel.BUSINESS);
    if (response) return response;

    const userId = user!.id;

    const activeGroups = await prisma.activeGroup.findMany({
      where: {
        createdById: userId,
      },
      include: {
        category: true,
        company: true,
        participants: true,
        images: {
          include: {
            image: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ activeGroups });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "שגיאה בשליפת קבוצות" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user, response } = await requireAuth(RoleLevel.BUSINESS);
    if (response) return response;

    const userId = user!.id;
    
    // Check package directly via userId
    const b2bPackage = await prisma.b2BPackage.findUnique({
      where: { userId },
    });

    if (!b2bPackage || !b2bPackage.isActive) {
      return NextResponse.json({ error: "אין לך חבילה פעילה" }, { status: 403 });
    }

    const activeGroupsCount = await prisma.activeGroup.count({
      where: {
        createdById: userId,
        status: { in: ["OPEN", "PENDING"] },
      },
    });

    if (activeGroupsCount >= b2bPackage.maxGroups) {
      return NextResponse.json({ error: "הגעת למגבלת הקבוצות בחבילה שלך" }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, categoryId, companyId, basePrice, groupPrice, deadline, imageUrls, minParticipants, maxParticipants, registrationTerms } = body;

    if (!title || !description || !categoryId || !companyId || !basePrice || !groupPrice || !deadline) {
      return NextResponse.json({ error: "כל השדות נדרשים" }, { status: 400 });
    }

    const created = await prisma.activeGroup.create({
      data: {
        title,
        description,
        categoryId,
        companyId,
        basePrice: parseFloat(basePrice),
        groupPrice: parseFloat(groupPrice),
        deadline: new Date(deadline),
        status: GroupStatus.OPEN,
        createdById: userId,
        minParticipants: minParticipants ? parseInt(minParticipants) : null,
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
        registrationTerms: registrationTerms || "",
      },
    });

    if (imageUrls && Array.isArray(imageUrls)) {
      const promises = imageUrls.map(async (url: string, i: number) => {
        const img = await prisma.image.create({ data: { url } });
        await prisma.activeGroupImage.create({
          data: { activeGroupId: created.id, imageId: img.id, order: i },
        });
      });
      await Promise.all(promises);
    }

    return NextResponse.json({ id: created.id }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "שגיאה ביצירת קבוצה" }, { status: 500 });
  }
}
