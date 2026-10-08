import { headers } from "next/headers";
import { getLocale } from "next-intl/server";
import { cache } from "react";

import { type CurrentUser, getUserFromHeaders } from "@/data/auth";
import { logSecurityEvent } from "@/data/security-log";
import { redirect } from "@/i18n/navigation";

/** The signed-in user of the current request, or null. One database lookup per render. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  return getUserFromHeaders(await headers());
});

/** The signed-in user, or a redirect to the sign-in page. For pages that require an account. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    logSecurityEvent("access.denied", { resource: "account", reason: "no-session" });
    return redirect({ href: "/connexion", locale: await getLocale() });
  }
  return user;
}
