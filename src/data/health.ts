import "server-only";

import { getPool } from "./db";

/** True when the database answers a trivial query. Never throws: a failure is a status, not an error. */
export async function pingDatabase(): Promise<boolean> {
  try {
    await getPool().query("select 1");
    return true;
  } catch {
    return false;
  }
}
