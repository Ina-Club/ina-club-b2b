import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { PackageType } from "@prisma/client";

const PACKAGE_CONFIG = {
  [PackageType.BASIC]: { maxGroups: 5, price: 299 },
  [PackageType.PREMIUM]: { maxGroups: 20, price: 599 },
  [PackageType.ENTERPRISE]: { maxGroups: 999, price: 1299 },
};

export async function POST(req: Request) {
  try {
    const { name, email, password, phone, packageType } = await req.json();

    if (!name || !email || !password || !packageType) {
      return NextResponse.json({ error: "כל השדות נדרשים" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "משתמש עם אימייל זה כבר קיים" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const config = PACKAGE_CONFIG[packageType as PackageType];

    if (!config) {
      return NextResponse.json({ error: "סוג חבילה לא תקין" }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role: "BUSINESS",
        b2bPackage: {
          create: {
            packageType: packageType as PackageType,
            maxGroups: config.maxGroups,
            price: config.price,
            isActive: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "שגיאה בהרשמה" }, { status: 500 });
  }
}

