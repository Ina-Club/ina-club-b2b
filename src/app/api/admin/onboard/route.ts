import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { requireAuth } from "@/lib/auth";
import { RoleLevel } from "@/lib/types/role";
import { PackageType } from "@prisma/client";
import { getUserByEmail } from "@/lib/services/user";

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
    const { email, packageType, maxGroups, price, endDate, companyTitle, companyAddress, companyCity } = body;

    if (!email || !packageType || maxGroups === undefined || price === undefined || !companyTitle) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) return NextResponse.json({ error: "User already exists with this email" }, { status: 400 });
    
    const existingInvitation = await prisma.b2BInvitation.findUnique({
      where: { email },
    });

    if (existingInvitation) {
      return NextResponse.json({ error: "Invitation already exists for this email" }, { status: 400 });
    }

    // Send Clerk invitation *before* modifying DB to prevent orphans on failure
    const invitation = await clerk.invitations.createInvitation({
      emailAddress: email,
      ignoreExisting: true,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard`,
    });

    const b2bInvitation = await prisma.b2BInvitation.create({
      data: {
        email,
        packageType: packageType as PackageType,
        maxGroups: parseInt(maxGroups, 10),
        price: parseFloat(price),
        endDate: endDate ? new Date(endDate) : null,
        companyTitle,
        companyAddress: companyAddress || null,
        companyCity: companyCity || null,
      },
    });

    return NextResponse.json({ 
      success: true, 
      b2bInvitation,
      invitationId: invitation.id 
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating package and sending invitation:", error.errors || error);
    
    return NextResponse.json(
      { error: "Error onboarding business"},
      { status: 500 }
    );
  }
}
