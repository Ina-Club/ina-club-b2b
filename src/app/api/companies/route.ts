import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      where: {
        verified: true,
      },
      select: {
        id: true,
        title: true,
        logoId: true,
        logo: {
          select: {
            url: true,
          },
        },
      },
      orderBy: {
        title: "asc",
      },
    });

    return NextResponse.json({ companies });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json(
      { error: "שגיאה בטעינת חברות" },
      { status: 500 }
    );
  }
}

