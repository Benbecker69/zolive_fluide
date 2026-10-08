import "server-only";

import { hash, verify } from "@node-rs/argon2";

/**
 * Password hashing (docs/adr/0004-better-auth-database-sessions.md, requirement SEC-04).
 * Argon2id with the minimum parameters of the OWASP Password Storage Cheat Sheet:
 * 19 MiB of memory, 2 iterations, 1 degree of parallelism. Argon2id is the default
 * algorithm of the library; the parameters are written out so that a change is deliberate.
 */
export const ARGON2_PARAMETERS = { memoryCost: 19456, timeCost: 2, parallelism: 1 } as const;

export function hashPassword(password: string): Promise<string> {
  return hash(password, ARGON2_PARAMETERS);
}

/** False for a wrong password and for a stored value that is not a valid hash: never throws. */
export async function verifyPassword(data: { hash: string; password: string }): Promise<boolean> {
  try {
    return await verify(data.hash, data.password);
  } catch {
    return false;
  }
}
