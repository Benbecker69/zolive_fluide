/**
 * Integration tests use their own database, never the development one.
 * The default matches the local development container (pnpm db:up).
 */
export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? "postgres://zolive:local-demo-only@localhost:5432/zolive_test";
