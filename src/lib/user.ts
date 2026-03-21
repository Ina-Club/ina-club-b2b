import { getCurrentUser as getClerkCurrentUser } from "@/lib/auth";

export async function getCurrentUser() {
  return await getClerkCurrentUser();
}
