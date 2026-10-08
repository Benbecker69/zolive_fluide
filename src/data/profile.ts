import "server-only";

import { eq } from "drizzle-orm";

import { getUserFromHeaders, renameUser } from "./auth";
import { getDb } from "./db";
import { addresses } from "./schema";
import { logSecurityEvent } from "./security-log";

/**
 * Profile of the signed-in customer.
 *
 * Access rule (requirement SEC-01): no function here takes a user identifier. Each one
 * finds its user in the session of the request, so a customer can only ever read or change
 * their own data: there is no identifier to tamper with.
 */

export type DeliveryAddress = {
  recipient: string;
  line1: string;
  line2: string | null;
  postalCode: string;
  city: string;
};

export type Profile = { name: string; email: string; address: DeliveryAddress | null };

export type ProfileChange = { ok: true } | { ok: false; reason: "unauthenticated" };

async function sessionUser(headers: Headers, resource: string) {
  const user = await getUserFromHeaders(headers);
  if (!user) logSecurityEvent("access.denied", { resource, reason: "no-session" });
  return user;
}

/** The profile of the signed-in customer, or null without a session. */
export async function getMyProfile(headers: Headers): Promise<Profile | null> {
  const user = await sessionUser(headers, "profile");
  if (!user) return null;

  const [address] = await getDb()
    .select({
      recipient: addresses.recipient,
      line1: addresses.line1,
      line2: addresses.line2,
      postalCode: addresses.postalCode,
      city: addresses.city,
    })
    .from(addresses)
    .where(eq(addresses.userId, user.id));

  return { name: user.name, email: user.email, address: address ?? null };
}

export async function renameMe(headers: Headers, name: string): Promise<ProfileChange> {
  const user = await sessionUser(headers, "profile");
  if (!user) return { ok: false, reason: "unauthenticated" };

  await renameUser(headers, name);
  return { ok: true };
}

/** Creates or replaces the delivery address of the signed-in customer. */
export async function saveMyAddress(
  headers: Headers,
  address: DeliveryAddress,
): Promise<ProfileChange> {
  const user = await sessionUser(headers, "address");
  if (!user) return { ok: false, reason: "unauthenticated" };

  await getDb()
    .insert(addresses)
    .values({ userId: user.id, ...address })
    .onConflictDoUpdate({ target: addresses.userId, set: { ...address, updatedAt: new Date() } });
  return { ok: true };
}
