import "server-only";

import { z } from "zod";

/**
 * Single entry point for configuration (docs/adr/0010-docker-compose-local-runtime.md).
 * Nothing else in the application reads `process.env`.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z
    .url({ error: "must be a PostgreSQL connection URL" })
    .refine((value) => /^postgres(ql)?:\/\//.test(value), {
      error: "must start with postgres:// or postgresql://",
    }),
  APP_URL: z.url({ error: "must be the public base URL of the site" }),
  // Signs the session cookies. Never committed: each environment has its own.
  BETTER_AUTH_SECRET: z.string().min(32, { error: "must be at least 32 characters long" }),
});

export type Env = z.infer<typeof envSchema>;

export class InvalidEnvError extends Error {
  constructor(readonly problems: string[]) {
    super(
      `Invalid environment configuration:\n${problems.map((problem) => `  - ${problem}`).join("\n")}`,
    );
    this.name = "InvalidEnvError";
  }
}

/** Validates a set of variables. Never includes a value in an error, only the variable name. */
export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(source);
  if (result.success) return result.data;

  const problems = result.error.issues.map((issue) => {
    const name = issue.path.join(".");
    const missing = source[name] === undefined || source[name] === "";
    return missing ? `${name} is missing` : `${name} ${issue.message}`;
  });
  throw new InvalidEnvError(problems);
}

let cached: Env | undefined;

/** Validated configuration, parsed on first use so that the build does not need it. */
export function getEnv(): Env {
  cached ??= parseEnv(process.env);
  return cached;
}
