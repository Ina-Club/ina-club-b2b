import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "אימייל נדרש" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    return NextResponse.json({ exists: !!user });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "שגיאה בבדיקת משתמש" }, { status: 500 });
  }
}

