import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, RoleLevel } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { session, response } = await requireAuth(RoleLevel.BUSINESS);
    if (response) return response;

    const companies = await prisma.company.findMany({
      orderBy: {
        title: "asc",
      },
    });

    return NextResponse.json({ companies });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "שגיאה בשליפת חברות" }, { status: 500 });
  }
}

