import { clerkClient } from "@clerk/nextjs/server";

export async function getUserByEmail(email: string) {
    const client = await clerkClient();
    const users = (await client.users.getUserList({
        emailAddress: [email],
        limit: 1
    })).data;
    return users.length > 0 ? users[0] : null
}
