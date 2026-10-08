import pg from "pg";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { signIn, signOut, signUp } from "@/data/auth";
import { getPool } from "@/data/db";
import { accountFingerprint, captureSecurityLog } from "@/data/security-log";
import { FAILURE_WINDOW_MINUTES, LOCK_MINUTES, MAX_FAILURES } from "@/data/sign-in-throttle";

import { TEST_DATABASE_URL } from "./test-database";

const client = new pg.Client({ connectionString: TEST_DATABASE_URL });
const headers = () => new Headers({ "user-agent": "integration-test" });

const camille = {
  name: "Camille Martin",
  email: "camille@example.org",
  password: "olive-verte-2026",
};
const WRONG = "mauvais-mot-de-passe";

/** A clock the tests move by hand, so that no test has to wait. */
const start = new Date("2026-10-08T10:00:00Z");
const after = (minutes: number) => new Date(start.getTime() + minutes * 60_000);

const fail = (email: string, at: Date) => signIn({ email, password: WRONG }, headers(), at);
const succeed = (at: Date) =>
  signIn({ email: camille.email, password: camille.password }, headers(), at);

async function failTimes(count: number, email = camille.email, at = start) {
  for (let attempt = 0; attempt < count; attempt += 1) await fail(email, at);
}

let lines: string[] = [];
let restore: () => void;

beforeAll(async () => {
  await client.connect();
});

beforeEach(async () => {
  await client.query('truncate table "user" cascade');
  await client.query("truncate table sign_in_throttles");
  await signUp(camille, headers());
  lines = [];
  restore = captureSecurityLog((line) => lines.push(line));
});

afterEach(() => restore());

afterAll(async () => {
  await client.end();
  await getPool().end();
});

const events = () => lines.map((line) => (JSON.parse(line) as { event: string }).event);

describe("sign-in throttling", () => {
  it("still accepts the right password just below the limit", async () => {
    await failTimes(MAX_FAILURES - 1);
    expect(await succeed(start)).toEqual({ ok: true });
  });

  it("locks the account once the limit is reached, even for the right password", async () => {
    await failTimes(MAX_FAILURES);

    expect(await succeed(after(1))).toEqual({
      ok: false,
      reason: "too-many-attempts",
      retryAfterSeconds: (LOCK_MINUTES - 1) * 60,
    });
  });

  it("answers the last failure like any other, so the limit itself is not revealed early", async () => {
    await failTimes(MAX_FAILURES - 1);
    expect(await fail(camille.email, start)).toEqual({ ok: false, reason: "invalid-credentials" });
  });

  it("unlocks by itself after the lock duration", async () => {
    await failTimes(MAX_FAILURES);
    expect(await succeed(after(LOCK_MINUTES))).toEqual({ ok: true });
  });

  it("forgets the failures after a successful sign-in", async () => {
    await failTimes(MAX_FAILURES - 1);
    await succeed(start);
    await failTimes(MAX_FAILURES - 1);

    expect(await succeed(start)).toEqual({ ok: true });
  });

  it("forgets failures older than the window", async () => {
    await failTimes(MAX_FAILURES - 1, camille.email, start);
    await fail(camille.email, after(FAILURE_WINDOW_MINUTES + 1));

    expect(await succeed(after(FAILURE_WINDOW_MINUTES + 2))).toEqual({ ok: true });
  });

  it("behaves the same for an address without account, so it reveals nothing", async () => {
    await failTimes(MAX_FAILURES, "nobody@example.org");

    expect(await fail("nobody@example.org", after(1))).toMatchObject({
      ok: false,
      reason: "too-many-attempts",
    });
  });

  it("locks one account without touching the others", async () => {
    await failTimes(MAX_FAILURES, "nobody@example.org");
    expect(await succeed(after(1))).toEqual({ ok: true });
  });

  it("treats the e-mail without regard to letter case or surrounding spaces", async () => {
    await failTimes(MAX_FAILURES, "  Camille@Example.ORG ");
    expect(await succeed(after(1))).toMatchObject({ ok: false, reason: "too-many-attempts" });
  });

  it("keeps its counters in the database, under a fingerprint and never the address", async () => {
    await failTimes(2);

    const { rows } = await client.query("select account, failures from sign_in_throttles");
    expect(rows).toEqual([{ account: accountFingerprint(camille.email), failures: 2 }]);
    expect(JSON.stringify(rows)).not.toContain("camille");
  });
});

describe("security log", () => {
  it("records failures, the lock, successes and sign-out", async () => {
    await failTimes(MAX_FAILURES);
    await fail(camille.email, after(1));
    await succeed(after(LOCK_MINUTES));
    await signOut(headers());

    expect(events()).toEqual([
      ...Array.from({ length: MAX_FAILURES }, () => "auth.sign_in.failed"),
      "auth.sign_in.locked",
      "auth.sign_in.succeeded",
    ]);
  });

  it("records sign-ups and refused sign-ups", async () => {
    await signUp({ ...camille, email: "sam@example.org" }, headers());
    await signUp(camille, headers());

    expect(events()).toEqual(["auth.sign_up.succeeded", "auth.sign_up.refused"]);
  });

  it("never writes a password, an e-mail address or a session token", async () => {
    await fail(camille.email, start);
    await succeed(start);
    await signUp({ ...camille, email: "sam@example.org" }, headers());

    const tokens = (await client.query("select token from session")).rows.map((row) => row.token);
    const forbidden = [camille.password, WRONG, camille.email, "sam@example.org", ...tokens];

    expect(lines.length).toBeGreaterThan(0);
    for (const secret of forbidden) {
      expect(lines.join("\n")).not.toContain(secret);
    }
  });

  it("writes one JSON object per line with a time and an event", async () => {
    await fail(camille.email, start);

    const entry = JSON.parse(lines[0] ?? "{}") as Record<string, unknown>;
    expect(entry).toMatchObject({
      level: "info",
      event: "auth.sign_in.failed",
      account: accountFingerprint(camille.email),
      reason: "invalid-credentials",
    });
    expect(typeof entry.time).toBe("string");
  });
});
