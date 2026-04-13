import { prisma } from "@/lib/prisma";
import { B2BInvitation } from "@prisma/client";

export async function handleB2BUserCreated(eventData: any) {
  const { id, email_addresses } = eventData;
  const email = email_addresses[0]?.email_address;

  if (email) {
    const invitation = await prisma.b2BInvitation.findUnique({
      where: { email },
    });

    if (invitation) {
      await commitB2BUserCreation(id, invitation);
      console.log(`Successfully onboarded B2B User ${id} from invitation ${email}`);
    } else {
      throw new Error(`No B2BInvitation found for the registered email: ${email}`);
    }
  }
  throw new Error(`No email found for the registered user: ${id}`);
}

async function commitB2BUserCreation(id: string, invitation: B2BInvitation) {
  await prisma.$transaction(async (tx) => {
    await tx.company.create({
      data: {
        ownerId: id,
        title: invitation.companyTitle,
        address: invitation.companyAddress,
        city: invitation.companyCity,
      },
    });

    await tx.b2BPackage.create({
      data: {
        userId: id,
        packageType: invitation.packageType,
        maxGroups: invitation.maxGroups,
        price: invitation.price,
      },
    });

    await tx.b2BInvitation.delete({
      where: { id: invitation.id },
    });
  });
}
