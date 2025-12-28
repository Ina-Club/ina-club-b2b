import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, RoleLevel } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { user, response } = await requireAuth(RoleLevel.BUSINESS);
    if (response) return response;

    if (!user) {
      return NextResponse.json({ error: "משתמש לא נמצא" }, { status: 404 });
    }

    const userWithCompany = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        company: {
          include: {
            categories: true,
            logo: true,
          },
        },
      },
    });

    if (!userWithCompany?.company) {
      return NextResponse.json({ company: null });
    }

    return NextResponse.json({
      company: {
        id: userWithCompany.company.id,
        title: userWithCompany.company.title,
        websiteUrl: userWithCompany.company.websiteUrl,
        description: userWithCompany.company.description,
        phone: userWithCompany.company.phone,
        email: userWithCompany.company.email,
        address: userWithCompany.company.address,
        city: userWithCompany.company.city,
        verified: userWithCompany.company.verified,
        categories: userWithCompany.company.categories.map((c) => ({
          id: c.id,
          name: c.name,
        })),
        logo: userWithCompany.company.logo?.url,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "שגיאה בשליפת פרטי החברה" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { user, response } = await requireAuth(RoleLevel.BUSINESS);
    if (response) return response;

    if (!user) {
      return NextResponse.json({ error: "משתמש לא נמצא" }, { status: 404 });
    }

    const body = await req.json();
    const {
      title,
      websiteUrl,
      description,
      phone,
      email,
      address,
      city,
      categoryIds,
    } = body;

    // Get or create company
    let company = await prisma.company.findFirst({
      where: { owner: { id: user.id } },
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          title: title || "חברה חדשה",
          websiteUrl,
          description,
          phone,
          email,
          address,
          city,
          owner: {
            connect: { id: user.id },
          },
          categories: categoryIds
            ? {
              connect: categoryIds.map((id: string) => ({ id })),
            }
            : undefined,
        },
      });
    } else {
      company = await prisma.company.update({
        where: { id: company.id },
        data: {
          title,
          websiteUrl,
          description,
          phone,
          email,
          address,
          city,
          categories: categoryIds
            ? {
              set: categoryIds.map((id: string) => ({ id })),
            }
            : undefined,
        },
        include: {
          categories: true,
        },
      });
    }

    return NextResponse.json({ company });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "שגיאה בעדכון פרטי החברה" },
      { status: 500 }
    );
  }
}

