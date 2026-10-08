import pg from "pg";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { signUp } from "@/data/auth";
import { getPool } from "@/data/db";
import { getMyProfile, saveMyAddress } from "@/data/profile";
import { captureSecurityLog } from "@/data/security-log";

import { TEST_DATABASE_URL } from "./test-database";

/**
 * The session lookup is replaced by a table of test sessions: a request "is" the user whose
 * identifier it carries in a test header. Everything else is real, database included, so
 * what is tested is the rule itself: profile functions only ever act on the session's user.
 * Real sessions and cookies are covered by the end-to-end tests.
 */
const sessions = new Map<string, { id: string; name: string; email: string }>();

vi.mock("@/data/auth", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/data/auth")>();
  return {
    ...original,
    getUserFromHeaders: async (headers: Headers) =>
      sessions.get(headers.get("x-test-session") ?? "") ?? null,
  };
});

const client = new pg.Client({ connectionString: TEST_DATABASE_URL });
const anonymous = () => new Headers();
const as = (session: string) => new Headers({ "x-test-session": session });

const address = {
  recipient: "Camille Martin",
  line1: "12 rue des Oliviers",
  line2: null,
  postalCode: "13100",
  city: "Aix-en-Provence",
};

let lines: string[] = [];
let restore: () => void;

beforeAll(async () => {
  await client.connect();
});

beforeEach(async () => {
  await client.query('truncate table "user" cascade');
  sessions.clear();
  for (const [session, name, email] of [
    ["camille", "Camille Martin", "camille@example.org"],
    ["sam", "Sam Taylor", "sam@example.org"],
  ] as const) {
    await signUp({ name, email, password: "olive-verte-2026" }, anonymous());
    const { rows } = await client.query('select id from "user" where email = $1', [email]);
    sessions.set(session, { id: rows[0].id, name, email });
  }
  lines = [];
  restore = captureSecurityLog((line) => lines.push(line));
});

afterEach(() => restore());

afterAll(async () => {
  await client.end();
  await getPool().end();
});

describe("without a session", () => {
  it("shows no profile", async () => {
    expect(await getMyProfile(anonymous())).toBeNull();
  });

  it("refuses to save an address, writes nothing and logs the refusal", async () => {
    expect(await saveMyAddress(anonymous(), address)).toEqual({
      ok: false,
      reason: "unauthenticated",
    });

    expect((await client.query("select count(*)::int as n from addresses")).rows[0].n).toBe(0);
    expect(lines.map((line) => JSON.parse(line).event)).toEqual(["access.denied"]);
  });

  it("refuses a session that matches no user", async () => {
    expect(await getMyProfile(as("nobody"))).toBeNull();
  });
});

describe("with a session", () => {
  it("returns the customer's own details, with no address at first", async () => {
    expect(await getMyProfile(as("camille"))).toEqual({
      name: "Camille Martin",
      email: "camille@example.org",
      address: null,
    });
  });

  it("saves the address of the session's customer and only theirs", async () => {
    expect(await saveMyAddress(as("camille"), address)).toEqual({ ok: true });

    expect((await getMyProfile(as("camille")))?.address).toEqual(address);
    expect((await getMyProfile(as("sam")))?.address).toBeNull();
  });

  it("keeps two customers' addresses apart", async () => {
    await saveMyAddress(as("camille"), address);
    await saveMyAddress(as("sam"), { ...address, recipient: "Sam Taylor", city: "Marseille" });

    expect((await getMyProfile(as("camille")))?.address?.city).toBe("Aix-en-Provence");
    expect((await getMyProfile(as("sam")))?.address?.city).toBe("Marseille");
  });

  it("replaces the address instead of adding a second one", async () => {
    await saveMyAddress(as("camille"), address);
    await saveMyAddress(as("camille"), { ...address, line2: "Bâtiment B", postalCode: "13090" });

    const { rows } = await client.query("select line2, postal_code from addresses");
    expect(rows).toEqual([{ line2: "Bâtiment B", postal_code: "13090" }]);
  });

  it("offers no way to name another customer: functions take the request, not an identifier", () => {
    expect(getMyProfile.length).toBe(1);
    expect(saveMyAddress.length).toBe(2);
  });
});

describe("database rules", () => {
  it("deletes the address with the account", async () => {
    await saveMyAddress(as("camille"), address);
    await client.query('delete from "user" where email = $1', ["camille@example.org"]);

    expect((await client.query("select count(*)::int as n from addresses")).rows[0].n).toBe(0);
  });
});
