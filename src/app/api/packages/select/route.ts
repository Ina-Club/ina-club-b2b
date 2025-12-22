import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, RoleLevel } from "@/lib/auth";
import { PackageType } from "@prisma/client";

const PACKAGE_CONFIG: Record<PackageType, { maxGroups: number; price: number }> = {
  BASIC: { maxGroups: 5, price: 299 },
  PREMIUM: { maxGroups: 20, price: 599 },
  ENTERPRISE: { maxGroups: 100, price: 1299 },
};

export async function POST(req: Request) {
  try {
    const { session, response } = await requireAuth(RoleLevel.USER);
    if (response) return response;

    const body = await req.json();
    const { packageType } = body as { packageType: PackageType };

    if (!packageType || !PACKAGE_CONFIG[packageType]) {
      return NextResponse.json({ error: "סוג חבילה לא תקין" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session!.user!.email! },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "משתמש לא נמצא" }, { status: 404 });
    }

    // Update user role to BUSINESS if not already
    if (user.role !== "BUSINESS" && user.role !== "ADMIN") {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: "BUSINESS" },
      });
    }

    const config = PACKAGE_CONFIG[packageType];
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

    // Check if user already has a package
    const existingPackage = await prisma.b2BPackage.findUnique({
      where: { userId: user.id },
    });

    let b2bPackage;
    if (existingPackage) {
      // Update existing package
      b2bPackage = await prisma.b2BPackage.update({
        where: { userId: user.id },
        data: {
          packageType,
          maxGroups: config.maxGroups,
          price: config.price,
          startDate: new Date(),
          endDate,
          isActive: true,
        },
      });
    } else {
      // Create new package
      b2bPackage = await prisma.b2BPackage.create({
        data: {
          userId: user.id,
          packageType,
          maxGroups: config.maxGroups,
          price: config.price,
          startDate: new Date(),
          endDate,
          isActive: true,
        },
      });
    }

    // Create payment record
    await prisma.payment.create({
      data: {
        b2bPackageId: b2bPackage.id,
        amount: config.price,
        status: "PENDING", // In production, this would be set after payment confirmation
        paymentDate: new Date(),
      },
    });

    // For now, we'll mark payment as completed (in production, integrate with payment gateway)
    // In a real scenario, you would redirect to a payment gateway and handle webhook callbacks
    await prisma.payment.updateMany({
      where: { b2bPackageId: b2bPackage.id, status: "PENDING" },
      data: { status: "COMPLETED" },
    });

    return NextResponse.json({
      success: true,
      package: b2bPackage,
      // In production, return payment URL here
      // paymentUrl: paymentGatewayUrl
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "שגיאה בבחירת החבילה" }, { status: 500 });
  }
}

