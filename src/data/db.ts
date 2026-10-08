import "server-only";

import { Pool } from "pg";

import { getEnv } from "./env";

/**
 * One connection pool per process. In development, hot reloading re-evaluates
 * modules: the pool is kept on `globalThis` so connections are not leaked.
 */
const globalForDb = globalThis as typeof globalThis & { zolivePool?: Pool };

export function getPool(): Pool {
  globalForDb.zolivePool ??= new Pool({
    connectionString: getEnv().DATABASE_URL,
    max: 10,
    connectionTimeoutMillis: 2_000,
  });
  return globalForDb.zolivePool;
}
