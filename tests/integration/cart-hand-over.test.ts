import pg from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { signUp } from "@/data/auth";
import { adoptCart, changeCartQuantity, countCartItems, getCartLines } from "@/data/cart";
import { getPool } from "@/data/db";

import { seed } from "../../scripts/db/seed.mjs";
import { TEST_DATABASE_URL } from "./test-database";

const client = new pg.Client({ connectionString: TEST_DATABASE_URL });
const MAX = 12;

async function add(cartId: string | undefined, sku: string, quantity: number): Promise<string> {
  const result = await changeCartQuantity({ cartId, sku, quantity, mode: "add", maxPerLine: MAX });
  if (!result.ok) throw new Error(`unexpected refusal: ${result.reason}`);
  return result.cartId;
}

async function createUser(email: string): Promise<string> {
  const result = await signUp({ name: "Test", email, password: "olive-verte-2026" }, new Headers());
  if (!result.ok) throw new Error("sign-up failed");
  return result.userId;
}

const quantities = async (cartId: string) =>
  Object.fromEntries((await getCartLines(cartId, "fr")).map((line) => [line.sku, line.quantity]));

const cartCount = async () =>
  (await client.query("select count(*)::int as n from carts")).rows[0].n as number;

let camille: string;

beforeAll(async () => {
  await client.connect();
});

beforeEach(async () => {
  await client.query('truncate table "user" cascade');
  await client.query("truncate table carts cascade");
  await seed(TEST_DATABASE_URL);
  camille = await createUser("camille@example.org");
});

afterAll(async () => {
  await client.end();
  await getPool().end();
});

describe("adopting a guest cart at sign-in", () => {
  it("returns nothing when there is neither a guest cart nor an account cart", async () => {
    expect(await adoptCart(undefined, camille, MAX)).toBeUndefined();
  });

  it("gives the guest cart to an account that has none, keeping its identifier", async () => {
    const guest = await add(undefined, "FV-50", 2);

    expect(await adoptCart(guest, camille, MAX)).toBe(guest);
    expect(await quantities(guest)).toEqual({ "FV-50": 2 });
    const { rows } = await client.query("select user_id from carts where id = $1", [guest]);
    expect(rows[0].user_id).toBe(camille);
  });

  it("returns the account cart when the visitor has no guest cart", async () => {
    const owned = await adoptCart(await add(undefined, "FV-50", 1), camille, MAX);

    expect(await adoptCart(undefined, camille, MAX)).toBe(owned);
    expect(await adoptCart("00000000-0000-4000-8000-000000000000", camille, MAX)).toBe(owned);
  });

  it("adds the guest lines to the account cart and deletes the guest cart", async () => {
    const owned = (await adoptCart(await add(undefined, "FV-50", 1), camille, MAX)) as string;
    const guest = await add(undefined, "FV-50", 2);
    await add(guest, "TN-180", 1);

    expect(await adoptCart(guest, camille, MAX)).toBe(owned);
    expect(await quantities(owned)).toEqual({ "FV-50": 3, "TN-180": 1 });
    expect(await countCartItems(guest)).toBe(0);
    expect(await cartCount()).toBe(1);
  });

  it("caps a merged quantity at the stock", async () => {
    const owned = (await adoptCart(await add(undefined, "FV-50", 2), camille, MAX)) as string;
    const guest = await add(undefined, "FV-50", 2);
    await client.query("update variants set stock = 3 where sku = 'FV-50'");

    await adoptCart(guest, camille, MAX);
    expect(await quantities(owned)).toEqual({ "FV-50": 3 });
  });

  it("caps a merged quantity at the limit per line", async () => {
    const owned = (await adoptCart(await add(undefined, "FV-50", 8), camille, MAX)) as string;
    const guest = await add(undefined, "FV-50", 8);

    await adoptCart(guest, camille, MAX);
    expect(await quantities(owned)).toEqual({ "FV-50": 12 });
  });

  it("leaves out a guest line whose format is no longer in stock", async () => {
    const owned = (await adoptCart(await add(undefined, "TN-180", 1), camille, MAX)) as string;
    const guest = await add(undefined, "FV-50", 1);
    await client.query("update variants set stock = 0 where sku = 'FV-50'");

    await adoptCart(guest, camille, MAX);
    expect(await quantities(owned)).toEqual({ "TN-180": 1 });
  });

  it("never takes a cart that belongs to another account", async () => {
    const sam = await createUser("sam@example.org");
    const samsCart = (await adoptCart(await add(undefined, "FV-50", 4), sam, MAX)) as string;

    expect(await adoptCart(samsCart, camille, MAX)).toBeUndefined();
    expect(await quantities(samsCart)).toEqual({ "FV-50": 4 });
    const { rows } = await client.query("select user_id from carts where id = $1", [samsCart]);
    expect(rows[0].user_id).toBe(sam);
  });

  it("merges two guest carts handed over at the same moment", async () => {
    const first = await add(undefined, "FV-50", 2);
    const second = await add(undefined, "TN-180", 1);

    const [a, b] = await Promise.all([
      adoptCart(first, camille, MAX),
      adoptCart(second, camille, MAX),
    ]);

    expect(a).toBe(b);
    expect(await quantities(a as string)).toEqual({ "FV-50": 2, "TN-180": 1 });
    expect(await cartCount()).toBe(1);
  });

  it("keeps at most one cart per account, as a database rule", async () => {
    await adoptCart(await add(undefined, "FV-50", 1), camille, MAX);

    await expect(
      client.query("insert into carts (user_id) values ($1)", [camille]),
    ).rejects.toMatchObject({ code: "23505" });
  });

  it("deletes the cart with the account", async () => {
    await adoptCart(await add(undefined, "FV-50", 1), camille, MAX);
    await client.query('delete from "user" where id = $1', [camille]);

    expect(await cartCount()).toBe(0);
  });
});
