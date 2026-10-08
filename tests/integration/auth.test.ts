import pg from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { signIn, signUp } from "@/data/auth";
import { getPool } from "@/data/db";

import { TEST_DATABASE_URL } from "./test-database";

const client = new pg.Client({ connectionString: TEST_DATABASE_URL });
const headers = () => new Headers({ "user-agent": "integration-test" });

const camille = {
  name: "Camille Martin",
  email: "camille@example.org",
  password: "olive-verte-2026",
};

const count = async (table: string) =>
  (await client.query(`select count(*)::int as n from "${table}"`)).rows[0].n as number;

beforeAll(async () => {
  await client.connect();
});

beforeEach(async () => {
  await client.query('truncate table "user" cascade');
});

afterAll(async () => {
  await client.end();
  await getPool().end();
});

describe("signing up", () => {
  it("creates the user, stores an Argon2id hash and opens a session in the database", async () => {
    expect(await signUp(camille, headers())).toMatchObject({ ok: true });

    const users = await client.query('select name, email from "user"');
    expect(users.rows).toEqual([{ name: "Camille Martin", email: "camille@example.org" }]);

    const accounts = await client.query("select provider_id, password from account");
    expect(accounts.rows[0].provider_id).toBe("credential");
    expect(accounts.rows[0].password).toMatch(/^\$argon2id\$v=19\$m=19456,t=2,p=1\$/);
    expect(accounts.rows[0].password).not.toContain(camille.password);

    expect(await count("session")).toBe(1);
  });

  it("refuses a second account with the same e-mail, whatever the letter case", async () => {
    await signUp(camille, headers());

    expect(await signUp({ ...camille, name: "Someone else" }, headers())).toEqual({
      ok: false,
      reason: "email-taken",
    });
    expect(await signUp({ ...camille, email: "Camille@Example.ORG" }, headers())).toEqual({
      ok: false,
      reason: "email-taken",
    });
    expect(await count("user")).toBe(1);
  });

  it("refuses a password shorter than the minimum even if a caller skipped the form checks", async () => {
    expect(await signUp({ ...camille, password: "short" }, headers())).toEqual({
      ok: false,
      reason: "rejected",
    });
    expect(await count("user")).toBe(0);
  });
});

describe("signing in", () => {
  beforeEach(async () => {
    await signUp(camille, headers());
    await client.query("delete from session");
  });

  it("opens a session for the right credentials", async () => {
    expect(
      await signIn({ email: camille.email, password: camille.password }, headers()),
    ).toMatchObject({
      ok: true,
    });
    expect(await count("session")).toBe(1);
  });

  it("gives the same answer for a wrong password and for an unknown e-mail", async () => {
    const wrongPassword = await signIn(
      { email: camille.email, password: "wrong-password-0" },
      headers(),
    );
    const unknownEmail = await signIn(
      { email: "nobody@example.org", password: camille.password },
      headers(),
    );

    expect(wrongPassword).toEqual({ ok: false, reason: "invalid-credentials" });
    expect(unknownEmail).toEqual(wrongPassword);
    expect(await count("session")).toBe(0);
  });
});
