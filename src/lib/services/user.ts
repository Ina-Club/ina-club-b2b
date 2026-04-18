import { clerkClient } from "@clerk/nextjs/server";

export async function getUserByEmail(email: string) {
    const client = await clerkClient();
    const users = (await client.users.getUserList({
        emailAddress: [email],
        limit: 1
    })).data;
    return users.length > 0 ? users[0] : null
}

export async function inviteUser(email: string) {
    const clerk = await clerkClient();
    const invitation = await clerk.invitations.createInvitation({
        emailAddress: email,
        ignoreExisting: true,
        redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard`,
    });
    return invitation
}
