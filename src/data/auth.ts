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
export type SignInResult = { ok: true } | { ok: false; reason: "invalid-credentials" };

/** The signed-in user of a request, read from its session in the database, or null. */
export async function getUserFromHeaders(headers: Headers): Promise<CurrentUser | null> {
  const session = await getAuth().api.getSession({ headers });
  if (!session) return null;
  const { id, name, email } = session.user;
  return { id, name, email };
}

export async function signUp(
  input: { name: string; email: string; password: string },
  headers: Headers,
): Promise<SignUpResult> {
  try {
    await getAuth().api.signUpEmail({ body: input, headers });
    return { ok: true };
  } catch (error) {
    if (error instanceof APIError) {
      return {
        ok: false,
        reason: error.status === "UNPROCESSABLE_ENTITY" ? "email-taken" : "rejected",
      };
    }
    throw error;
  }
}

/**
 * Signs in. A wrong password and an unknown e-mail give the same answer, so the result
 * never tells whether an account exists.
 */
export async function signIn(
  input: { email: string; password: string },
  headers: Headers,
): Promise<SignInResult> {
  try {
    await getAuth().api.signInEmail({ body: input, headers });
    return { ok: true };
  } catch (error) {
    if (error instanceof APIError) return { ok: false, reason: "invalid-credentials" };
    throw error;
  }
}

/** Ends the session of a request: it is deleted from the database, not only from the browser. */
export async function signOut(headers: Headers): Promise<void> {
  try {
    await getAuth().api.signOut({ headers });
  } catch (error) {
    // Signing out without a session is not an error for the visitor.
    if (!(error instanceof APIError)) throw error;
  }
}
