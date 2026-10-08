import "server-only";

import { eq, sql } from "drizzle-orm";

import { getDb } from "./db";
import { signInThrottles } from "./schema";
import { accountFingerprint } from "./security-log";

/**
 * Limits sign-in attempts per account (docs/adr/0014-sign-in-throttling.md, requirement SEC-05).
 *
 * After too many failures in a short time, sign-in is refused for a while, whatever the
 * password. Counters live in the database, so a restart does not reset them. The account is
 * identified by a fingerprint of the e-mail typed, known or not: the behaviour is the same
 * for an address without account, so it does not reveal which addresses exist.
 */

export const MAX_FAILURES = 5;
export const FAILURE_WINDOW_MINUTES = 15;
export const LOCK_MINUTES = 15;

const minutes = (count: number) => count * 60_000;

/** Seconds left before sign-in is allowed again for this e-mail, or 0 when it is allowed. */
export async function secondsUntilUnlocked(email: string, now: Date): Promise<number> {
  const [row] = await getDb()
    .select({ lockedUntil: signInThrottles.lockedUntil })
    .from(signInThrottles)
    .where(eq(signInThrottles.account, accountFingerprint(email)));

  const remaining = (row?.lockedUntil?.getTime() ?? 0) - now.getTime();
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}

/**
 * Records a failed attempt. Returns true when this failure locks the account.
 * A single statement: two simultaneous failures cannot both miss the limit.
 */
export async function recordFailure(email: string, now: Date): Promise<boolean> {
  const windowStart = new Date(now.getTime() - minutes(FAILURE_WINDOW_MINUTES));
  const lockedUntil = new Date(now.getTime() + minutes(LOCK_MINUTES));

  const [row] = await getDb()
    .insert(signInThrottles)
    .values({ account: accountFingerprint(email), failures: 1, windowStartedAt: now })
    .onConflictDoUpdate({
      target: signInThrottles.account,
      set: {
        // Failures older than the window are forgotten: the count starts again at one.
        failures: sql`case when ${signInThrottles.windowStartedAt} < ${windowStart} then 1 else ${signInThrottles.failures} + 1 end`,
        windowStartedAt: sql`case when ${signInThrottles.windowStartedAt} < ${windowStart} then ${now} else ${signInThrottles.windowStartedAt} end`,
      },
    })
    .returning({ failures: signInThrottles.failures });

  if ((row?.failures ?? 0) < MAX_FAILURES) return false;

  await getDb()
    .update(signInThrottles)
    .set({ lockedUntil, failures: 0, windowStartedAt: now })
    .where(eq(signInThrottles.account, accountFingerprint(email)));
  return true;
}

/** Forgets the failures of an account, after a successful sign-in. */
export async function clearFailures(email: string): Promise<void> {
  await getDb()
    .delete(signInThrottles)
    .where(eq(signInThrottles.account, accountFingerprint(email)));
}
