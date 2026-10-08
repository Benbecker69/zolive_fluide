import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

import { TEST_DATABASE_URL } from "./tests/integration/test-database";

/**
 * Integration tests run against a real PostgreSQL database (docs/adr/0007-testing-strategy.md):
 * constraints, transactions and access rules cannot be proven on a simulated one.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "server-only": fileURLToPath(new URL("./tests/stubs/server-only.ts", import.meta.url)),
    },
  },
  test: {
    include: ["tests/integration/**/*.test.ts"],
    environment: "node",
    globalSetup: ["./tests/integration/global-setup.ts"],
    // One database for all files: they must not run at the same time.
    fileParallelism: false,
    env: {
      DATABASE_URL: TEST_DATABASE_URL,
      APP_URL: "http://localhost:3000",
      BETTER_AUTH_SECRET: "integration-tests-only-0123456789abcdef",
    },
  },
});
