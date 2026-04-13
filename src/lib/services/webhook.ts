import { prisma } from "@/lib/prisma";

export async function handleUserCreated(eventData: any) {
  const { id, email_addresses } = eventData;
  const email = email_addresses[0]?.email_address;

  if (email) {
    const existingPackage = await prisma.b2BPackage.findUnique({
      where: { email },
    });

    if (existingPackage) {
      await prisma.b2BPackage.update({
        where: { id: existingPackage.id },
        data: {
          userId: id,
          email: null,
        },
      });
    } else {
      console.error(`No B2BPackage found for the registered email: ${email}`);
    }
  }
}
