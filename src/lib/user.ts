import { prisma } from "lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getUserIdBySession(session: any) {
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  return user?.id || "";
}

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  return await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      b2bPackage: true,
    },
  });
}

