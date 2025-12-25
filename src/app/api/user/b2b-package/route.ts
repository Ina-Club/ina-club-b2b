import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, RoleLevel } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { user, response } = await requireAuth(RoleLevel.USER);
    if (response) return response;

    if (!user) {
      return NextResponse.json({ error: "משתמש לא נמצא" }, { status: 404 });
    }

    const b2bPackage = await prisma.b2BPackage.findUnique({
      where: { userId: user!.id },
      select: {
        id: true,
        packageType: true,
        maxGroups: true,
        price: true,
        startDate: true,
        endDate: true,
        isActive: true,
      },  
    });

    if (!b2bPackage) {
      return NextResponse.json({ error: "חבילה לא נמצאה" }, { status: 404 });
    }

    // Check if package is still active
    if (b2bPackage.endDate && new Date() > b2bPackage.endDate) {
      await prisma.b2BPackage.update({
        where: { id: b2bPackage.id },
        data: { isActive: false },
      });
      return NextResponse.json({ error: "חבילה פגה" }, { status: 404 });
    }

    return NextResponse.json({ package: b2bPackage });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "שגיאה בשליפת החבילה" }, { status: 500 });
  }
}

