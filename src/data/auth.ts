import "server-only";

import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";

import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "@/lib/password-policy";

import * as authSchema from "./auth-schema";
import { getDb } from "./db";
import { getEnv } from "./env";
import { hashPassword, verifyPassword } from "./password";
import { accountFingerprint, logSecurityEvent } from "./security-log";
import { clearFailures, recordFailure, secondsUntilUnlocked } from "./sign-in-throttle";

/**
 * Authentication (docs/adr/0004-better-auth-database-sessions.md).
 *
 * - E-mail and password only; passwords hashed with Argon2id.
 * - Sessions live in the database, so signing out revokes them.
 * - The session cookie is HttpOnly, Secure and SameSite=Lax.
 * - The library is only called from the server: its HTTP endpoints are not mounted,
 *   which keeps the public surface to the server actions of the site.
 */

function createAuth() {
  const env = getEnv();
  return betterAuth({
    baseURL: env.APP_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(getDb(), { provider: "pg", schema: authSchema }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: PASSWORD_MIN_LENGTH,
      maxPasswordLength: PASSWORD_MAX_LENGTH,
      password: { hash: hashPassword, verify: verifyPassword },
    },
    advanced: {
      cookiePrefix: "zolive",
      useSecureCookies: true,
    },
    // Must stay last: lets server actions set the cookies returned by the library.
    plugins: [nextCookies()],
  });
}

type Auth = ReturnType<typeof createAuth>;
let instance: Auth | undefined;

/** Created on first use, so that the build does not need the configuration. */
function getAuth(): Auth {
  instance ??= createAuth();
  return instance;
}

export type CurrentUser = { id: string; name: string; email: string };

export type SignUpResult = { ok: true } | { ok: false; reason: "email-taken" | "rejected" };
export type SignInResult =
  | { ok: true }
  | { ok: false; reason: "invalid-credentials" }
  | { ok: false; reason: "too-many-attempts"; retryAfterSeconds: number };

/** The signed-in user of a request, read from its session in the database, or null. */
export async function getUserFromHeaders(headers: Headers): Promise<CurrentUser | null> {
  const session = await getAuth().api.getSession({ headers });
  if (!session) return null;
  const { id, name, email } = session.user;
  return { id, name, email };
}

/** Changes the display name of the signed-in user of a request. */
export async function renameUser(headers: Headers, name: string): Promise<void> {
  await getAuth().api.updateUser({ body: { name }, headers });
}

export async function signUp(
  input: { name: string; email: string; password: string },
  headers: Headers,
): Promise<SignUpResult> {
  const account = accountFingerprint(input.email);
  try {
    const { user } = await getAuth().api.signUpEmail({ body: input, headers });
    logSecurityEvent("auth.sign_up.succeeded", { userId: user.id });
    return { ok: true };
  } catch (error) {
    if (error instanceof APIError) {
      const reason = error.status === "UNPROCESSABLE_ENTITY" ? "email-taken" : "rejected";
      logSecurityEvent("auth.sign_up.refused", { account, reason });
      return { ok: false, reason };
    }
    throw error;
  }
}

/**
 * Signs in. A wrong password and an unknown e-mail give the same answer, so the result
 * never tells whether an account exists. After too many failures the account is locked
 * for a while: the password is then not even checked.
 */
export async function signIn(
  input: { email: string; password: string },
  headers: Headers,
  now: Date = new Date(),
): Promise<SignInResult> {
  const account = accountFingerprint(input.email);

  const retryAfterSeconds = await secondsUntilUnlocked(input.email, now);
  if (retryAfterSeconds > 0) {
    logSecurityEvent("auth.sign_in.locked", { account });
    return { ok: false, reason: "too-many-attempts", retryAfterSeconds };
  }

  try {
    const { user } = await getAuth().api.signInEmail({ body: input, headers });
    await clearFailures(input.email);
    logSecurityEvent("auth.sign_in.succeeded", { userId: user.id });
    return { ok: true };
  } catch (error) {
    if (!(error instanceof APIError)) throw error;

    const locked = await recordFailure(input.email, now);
    logSecurityEvent("auth.sign_in.failed", {
      account,
      reason: locked ? "limit-reached" : "invalid-credentials",
    });
    return { ok: false, reason: "invalid-credentials" };
  }
}

/** Ends the session of a request: it is deleted from the database, not only from the browser. */
export async function signOut(headers: Headers): Promise<void> {
  try {
    const session = await getAuth().api.getSession({ headers });
    await getAuth().api.signOut({ headers });
    if (session) logSecurityEvent("auth.sign_out", { userId: session.user.id });
  } catch (error) {
    // Signing out without a session is not an error for the visitor.
    if (!(error instanceof APIError)) throw error;
  }
}
