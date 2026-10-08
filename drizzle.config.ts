import { defineConfig } from "drizzle-kit";

/**
 * Configuration of the migration generator (pnpm db:generate).
 * Generating migrations only reads the schema: no database connection is needed.
 */
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/data/schema.ts",
  out: "./drizzle",
});
