/**
 * Applies the SQL migrations of the `drizzle/` folder. One-off administration command
 * (pnpm db:migrate): migrations already applied are skipped.
 */
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate as applyMigrations } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

export async function migrate(connectionString) {
  const client = new pg.Client({ connectionString });
  await client.connect();
  try {
    await applyMigrations(drizzle(client), { migrationsFolder: "./drizzle" });
  } finally {
    await client.end();
  }
}

// Run only when called directly, not when imported by the tests.
if (process.argv[1]?.endsWith("migrate.mjs")) {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is missing");
    process.exit(1);
  }
  await migrate(url);
  console.log("Migrations applied");
}
