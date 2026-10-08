import { headers } from "next/headers";
import { cache } from "react";

import { type CurrentUser, getUserFromHeaders } from "@/data/auth";
import { getMyProfile, type Profile } from "@/data/profile";

/** The signed-in user of the current request, or null. One database lookup per render. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  return getUserFromHeaders(await headers());
});

/** The profile of the signed-in customer, or null without a session. */
export async function getProfile(): Promise<Profile | null> {
  return getMyProfile(await headers());
}
