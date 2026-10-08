import "server-only";

import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { getEnv } from "./env";
import * as schema from "./schema";

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

/** Typed query builder over the pool. Only the data layer may use it. */
export function getDb(): NodePgDatabase<typeof schema> {
  return drizzle(getPool(), { schema });
}
