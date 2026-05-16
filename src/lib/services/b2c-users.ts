import { createClerkClient } from "@clerk/nextjs/server";

const b2cClient = createClerkClient({ 
  secretKey: process.env.B2C_CLERK_SECRET_KEY || "" 
});

export interface B2CUser {
  userId: string;
  name: string;
  email: string;
}

export async function getB2CUser(userId: string): Promise<B2CUser> {
  try {
    const clerkUser = await b2cClient.users.getUser(userId);
    return {
      userId,
      name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "משתמש",
      email: clerkUser.emailAddresses[0]?.emailAddress || "",
    };
  } catch (err) {
    return {
      userId,
      name: "משתמש לא ידוע",
      email: "",
    };
  }
}

export async function getB2CUsers(userIds: string[]): Promise<Map<string, B2CUser>> {
  if (userIds.length === 0) return new Map();

  const usersMap = new Map<string, B2CUser>();
  const chunkSize = 100;
  
  // Fetch user IDs in parallel batches of 100 (Clerk's limit)
  const promises = [];
  for (let i = 0; i < userIds.length; i += chunkSize) {
    promises.push(
      b2cClient.users.getUserList({ 
        userId: userIds.slice(i, i + chunkSize), 
        limit: chunkSize 
      })
    );
  }

  const results = await Promise.allSettled(promises);

  results.forEach((result) => {
    if (result.status === "fulfilled") {
      result.value.data.forEach((u) => {
        usersMap.set(u.id, {
          userId: u.id,
          name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || "משתמש",
          email: u.emailAddresses[0]?.emailAddress || "",
        });
      });
    } else {
      console.error("A batch of user IDs failed to fetch:", result.reason);
    }
  });

  // For any IDs that weren't found in the response, fill with default "unknown"
  userIds.forEach(id => {
    if (!usersMap.has(id)) {
      usersMap.set(id, {
        userId: id,
        name: "משתמש לא ידוע",
        email: "",
      });
    }
  });

  return usersMap;
}
