import { prisma } from "lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export enum RoleLevel {
  USER = 0,
  BUSINESS = 1,
  ADMIN = 2,
}

export function roleToLevel(role: Role): RoleLevel {
  switch (role) {
    case Role.USER:
      return RoleLevel.USER;
    case Role.BUSINESS:
      return RoleLevel.BUSINESS;
    case Role.ADMIN:
      return RoleLevel.ADMIN;
    default:
      throw new Error(`Unhandled role: ${role}`);
  }
}

export async function requireAuth(minRole: RoleLevel) {
  const { session, response } = await validateSession();
  if (response) return { session, response };

  const user = await prisma.user.findUnique({
    where: { email: session!.user!.email! },
    select: { id: true, role: true },
  });

  if (!user) return { session: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (roleToLevel(user.role) < minRole) return { session: null, response: NextResponse.json({ error: "Not Found" }, { status: 404 }) };

  return { session, response: null };
}

export async function validateSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return {
      session: null,
      response: NextResponse.json({ error: "לא מורשה" }, { status: 401 }),
    };
  }
  return { session, response: null };
}

export async function getUserIdBySession(session: any) {
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  return user?.id || "";
}

