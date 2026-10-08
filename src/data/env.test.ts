import { describe, expect, it } from "vitest";

import { InvalidEnvError, parseEnv } from "./env";

const valid = {
  NODE_ENV: "production",
  DATABASE_URL: "postgres://user:secret-value@db:5432/zolive",
  APP_URL: "http://localhost:3000",
};

function problemsOf(source: Record<string, string | undefined>): string[] {
  try {
    parseEnv(source);
  } catch (error) {
    if (error instanceof InvalidEnvError) return error.problems;
    throw error;
  }
  throw new Error("expected the configuration to be rejected");
}

describe("parseEnv", () => {
  it("accepts a complete configuration", () => {
    expect(parseEnv(valid)).toEqual(valid);
  });

  it("defaults NODE_ENV to development", () => {
    expect(parseEnv({ ...valid, NODE_ENV: undefined }).NODE_ENV).toBe("development");
  });

  it("names every missing variable", () => {
    expect(problemsOf({})).toEqual(["DATABASE_URL is missing", "APP_URL is missing"]);
  });

  it("treats an empty value as missing", () => {
    expect(problemsOf({ ...valid, APP_URL: "" })).toEqual(["APP_URL is missing"]);
  });

  it("rejects a database URL that is not PostgreSQL", () => {
    expect(problemsOf({ ...valid, DATABASE_URL: "mysql://user:secret-value@db/zolive" })).toEqual([
      "DATABASE_URL must start with postgres:// or postgresql://",
    ]);
  });

  it("never echoes a value in the error message", () => {
    const source = { ...valid, DATABASE_URL: "mysql://user:secret-value@db/zolive" };
    expect(() => parseEnv(source)).toThrowError(InvalidEnvError);
    try {
      parseEnv(source);
    } catch (error) {
      expect(String((error as Error).message)).not.toContain("secret-value");
    }
  });
});
