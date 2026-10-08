import pg from "pg";

import { migrate } from "../../scripts/db/migrate.mjs";
import { TEST_DATABASE_URL } from "./test-database";

/** Creates the test database when it does not exist, then brings its schema up to date. */
export default async function setup(): Promise<void> {
  const target = new URL(TEST_DATABASE_URL);
  const name = target.pathname.slice(1);

  const maintenance = new URL(TEST_DATABASE_URL);
  maintenance.pathname = "/postgres";
  const client = new pg.Client({ connectionString: maintenance.toString() });
  await client.connect();
  try {
    const existing = await client.query("select 1 from pg_database where datname = $1", [name]);
    if (existing.rowCount === 0) {
      await client.query(`create database ${client.escapeIdentifier(name)}`);
    }
  } finally {
    await client.end();
  }

  await migrate(TEST_DATABASE_URL);
}
