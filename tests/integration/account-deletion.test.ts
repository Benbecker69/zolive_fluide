import pg from "pg";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { deleteAccount, getUserFromHeaders, signIn, signUp } from "@/data/auth";
import { adoptCart, changeCartQuantity } from "@/data/cart";
import { getPool } from "@/data/db";
import { saveMyAddress } from "@/data/profile";
import { captureSecurityLog } from "@/data/security-log";
import { MAX_FAILURES } from "@/data/sign-in-throttle";

import { seed } from "../../scripts/db/seed.mjs";
import { sessionHeaders } from "./session-cookie";
import { TEST_DATABASE_URL } from "./test-database";

const client = new pg.Client({ connectionString: TEST_DATABASE_URL });

const camille = {
  name: "Camille Martin",
  email: "camille@example.org",
  password: "olive-verte-2026",
};
const sam = { name: "Sam Taylor", email: "sam@example.org", password: "tapenade-noire-2026" };

const count = async (table: string) =>
  (await client.query(`select count(*)::int as n from "${table}"`)).rows[0].n as number;

const emails = async () =>
  (await client.query('select email from "user" order by email')).rows.map((row) => row.email);

let lines: string[] = [];
let restore: () => void;
let camilleId: string;

beforeAll(async () => {
  await client.connect();
});

beforeEach(async () => {
  await client.query('truncate table "user" cascade');
  await client.query("truncate table carts cascade");
  await client.query("truncate table sign_in_throttles");
  await seed(TEST_DATABASE_URL);

  const created = await signUp(camille, new Headers());
  if (!created.ok) throw new Error("sign-up failed");
  camilleId = created.userId;
  await signUp(sam, new Headers());

  lines = [];
  restore = captureSecurityLog((line) => lines.push(line));
});

afterEach(() => restore());

afterAll(async () => {
  await client.end();
  await getPool().end();
});

describe("the session used by these tests", () => {
  it("is the real one: the rebuilt cookie identifies the customer", async () => {
    const user = await getUserFromHeaders(await sessionHeaders(client, camille.email));
    expect(user).toMatchObject({ id: camilleId, email: camille.email });
  });
});

describe("deleting my account", () => {
  it("removes the account and everything attached to it, and nothing of another customer", async () => {
    const headers = await sessionHeaders(client, camille.email);
    // A second session, as on another device.
    await signIn({ email: camille.email, password: camille.password }, new Headers());
    await saveMyAddress(headers, {
      recipient: "Camille Martin",
      line1: "12 rue des Oliviers",
      line2: null,
      postalCode: "13100",
      city: "Aix-en-Provence",
    });
    const cart = await changeCartQuantity({
      cartId: undefined,
      sku: "FV-50",
      quantity: 2,
      mode: "add",
      maxPerLine: 12,
    });
    if (!cart.ok) throw new Error("cart refused");
    await adoptCart(cart.cartId, camilleId, 12);

    expect(await deleteAccount(headers, camille.password)).toEqual({ ok: true });

    expect(await emails()).toEqual([sam.email]);
    expect((await client.query("select user_id from session")).rows).toHaveLength(1);
    expect((await client.query("select user_id from account")).rows).toHaveLength(1);
    expect(await count("addresses")).toBe(0);
    expect(await count("carts")).toBe(0);
    expect(await count("cart_items")).toBe(0);
    expect(await getUserFromHeaders(headers)).toBeNull();
  });

  it("refuses a wrong password and deletes nothing", async () => {
    const headers = await sessionHeaders(client, camille.email);

    expect(await deleteAccount(headers, "not-the-password")).toEqual({
      ok: false,
      reason: "wrong-password",
    });
    expect(await emails()).toEqual([camille.email, sam.email]);
  });

  it("refuses an empty password even on a session opened a moment ago", async () => {
    const headers = await sessionHeaders(client, camille.email);

    expect(await deleteAccount(headers, "")).toEqual({ ok: false, reason: "wrong-password" });
    expect(await emails()).toEqual([camille.email, sam.email]);
  });

  it("refuses the password of another customer", async () => {
    const headers = await sessionHeaders(client, camille.email);

    expect(await deleteAccount(headers, sam.password)).toEqual({
      ok: false,
      reason: "wrong-password",
    });
    expect(await emails()).toEqual([camille.email, sam.email]);
  });

  it("refuses without a session, whatever the password", async () => {
    expect(await deleteAccount(new Headers(), camille.password)).toEqual({
      ok: false,
      reason: "unauthenticated",
    });
    expect(await emails()).toEqual([camille.email, sam.email]);
  });

  it("locks the confirmation after too many wrong passwords, the right one included", async () => {
    const headers = await sessionHeaders(client, camille.email);
    for (let attempt = 0; attempt < MAX_FAILURES; attempt += 1) {
      await deleteAccount(headers, "not-the-password");
    }

    expect(await deleteAccount(headers, camille.password)).toMatchObject({
      ok: false,
      reason: "too-many-attempts",
    });
    expect(await emails()).toEqual([camille.email, sam.email]);
  });

  it("lets the same e-mail address sign up again afterwards, with no counter left", async () => {
    const headers = await sessionHeaders(client, camille.email);
    await deleteAccount(headers, "not-the-password");
    await deleteAccount(headers, camille.password);

    expect(await count("sign_in_throttles")).toBe(0);
    expect(
      await signIn({ email: camille.email, password: camille.password }, new Headers()),
    ).toEqual({ ok: false, reason: "invalid-credentials" });
    expect(await signUp(camille, new Headers())).toMatchObject({ ok: true });
  });

  it("logs the deletion and the refusals without any personal data", async () => {
    const headers = await sessionHeaders(client, camille.email);
    await deleteAccount(headers, "not-the-password");
    await deleteAccount(headers, camille.password);

    const events = lines.map((line) => JSON.parse(line));
    expect(events.map((event) => event.event)).toEqual([
      "account.delete.refused",
      "account.deleted",
    ]);
    expect(events[1].userId).toBe(camilleId);
    const log = lines.join("\n");
    expect(log).not.toContain(camille.email);
    expect(log).not.toContain(camille.password);
    expect(log).not.toContain("not-the-password");
  });
});
