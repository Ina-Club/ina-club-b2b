import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { requireAuth } from "@/lib/auth";
import { RoleLevel } from "@/lib/types/role";
import { PackageType } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const { user, response } = await requireAuth(RoleLevel.ADMIN);
    if (response) return response;
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clerk = await clerkClient();
    const serverUser = await clerk.users.getUser(user.id);
    // This should be added manually in the clerk dashboard
    if (serverUser.publicMetadata.role !== RoleLevel.ADMIN) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { email, packageType, maxGroups, price, endDate } = body;

    if (!email || !packageType || maxGroups === undefined || price === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingPackage = await prisma.b2BPackage.findUnique({
      where: { email },
    });

    if (existingPackage) {
      return NextResponse.json({ error: "Package already exists for this email" }, { status: 400 });
    }

    const b2bPackage = await prisma.b2BPackage.create({
      data: {
        email,
        packageType: packageType as PackageType,
        maxGroups: parseInt(maxGroups, 10),
        price: parseFloat(price),
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    const invitation = await clerk.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard`,
    });

    return NextResponse.json({ 
      success: true, 
      b2bPackage,
      invitationId: invitation.id 
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating package and sending invitation:", error);
    return NextResponse.json(
      { error: "Error onboarding business", details: error.message },
      { status: 500 }
    );
  }
}
