import pg from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { changeCartQuantity, countCartItems, getCartLines, removeCartLine } from "@/data/cart";
import { getPool } from "@/data/db";

import { seed } from "../../scripts/db/seed.mjs";
import { TEST_DATABASE_URL } from "./test-database";

const client = new pg.Client({ connectionString: TEST_DATABASE_URL });
const MAX = 12;

/** Adds to a cart and returns its identifier, failing the test if the change is refused. */
async function add(cartId: string | undefined, sku: string, quantity: number): Promise<string> {
  const result = await changeCartQuantity({ cartId, sku, quantity, mode: "add", maxPerLine: MAX });
  if (!result.ok) throw new Error(`unexpected refusal: ${result.reason}`);
  return result.cartId;
}

const cartCount = async () =>
  (await client.query("select count(*)::int as n from carts")).rows[0].n as number;

beforeAll(async () => {
  await client.connect();
});

beforeEach(async () => {
  // A fresh catalogue and no cart: each test starts from the same state.
  await client.query("truncate table carts cascade");
  await seed(TEST_DATABASE_URL);
});

afterAll(async () => {
  await client.end();
  await getPool().end();
});

describe("adding to a cart", () => {
  it("creates the cart on the first addition and returns its identifier", async () => {
    const cartId = await add(undefined, "FV-50", 2);

    expect(cartId).toMatch(/^[0-9a-f-]{36}$/);
    expect(await getCartLines(cartId, "fr")).toEqual([
      {
        sku: "FV-50",
        productSlug: "fruite-vert",
        name: "Fruité vert",
        format: "50 cl",
        unitPriceCents: 2400,
        quantity: 2,
        stock: 60,
      },
    ]);
  });

  it("adds to the quantity already in the cart", async () => {
    const cartId = await add(undefined, "FV-50", 2);
    await add(cartId, "FV-50", 3);

    expect(await countCartItems(cartId)).toBe(5);
    expect(await getCartLines(cartId, "fr")).toHaveLength(1);
  });

  it("keeps one line per format and lists them in catalogue order", async () => {
    const cartId = await add(undefined, "TN-180", 1);
    await add(cartId, "FV-75", 1);
    await add(cartId, "FV-25", 1);

    expect((await getCartLines(cartId, "en")).map((line) => [line.name, line.format])).toEqual([
      ["Green fruity", "25 cl"],
      ["Green fruity", "75 cl"],
      ["Black olive tapenade", "180 g"],
    ]);
  });

  it("starts a new cart when the identifier matches no cart", async () => {
    const stale = "00000000-0000-4000-8000-000000000000";
    const cartId = await add(stale, "FV-50", 1);

    expect(cartId).not.toBe(stale);
    expect(await countCartItems(cartId)).toBe(1);
  });

  it("ignores an identifier that is not a cart identifier", async () => {
    const cartId = await add("'; drop table carts; --", "FV-50", 1);
    expect(await countCartItems(cartId)).toBe(1);
  });
});

describe("refusals", () => {
  it("refuses a product that does not exist, without creating a cart", async () => {
    const result = await changeCartQuantity({
      cartId: undefined,
      sku: "NOPE-1",
      quantity: 1,
      mode: "add",
      maxPerLine: MAX,
    });

    expect(result).toEqual({ ok: false, reason: "unknown-product" });
    expect(await cartCount()).toBe(0);
  });

  it("refuses more than the stock and says how many are left", async () => {
    await client.query("update variants set stock = 3 where sku = 'FV-50'");

    const result = await changeCartQuantity({
      cartId: undefined,
      sku: "FV-50",
      quantity: 4,
      mode: "add",
      maxPerLine: MAX,
    });

    expect(result).toEqual({ ok: false, reason: "insufficient-stock", available: 3 });
    expect(await cartCount()).toBe(0);
  });

  it("counts what is already in the cart against the stock", async () => {
    await client.query("update variants set stock = 3 where sku = 'FV-50'");
    const cartId = await add(undefined, "FV-50", 2);

    const result = await changeCartQuantity({
      cartId,
      sku: "FV-50",
      quantity: 2,
      mode: "add",
      maxPerLine: MAX,
    });

    expect(result).toEqual({ ok: false, reason: "insufficient-stock", available: 3 });
    expect(await countCartItems(cartId)).toBe(2);
  });

  it("refuses a format that is out of stock", async () => {
    const result = await changeCartQuantity({
      cartId: undefined,
      sku: "FN-75",
      quantity: 1,
      mode: "add",
      maxPerLine: MAX,
    });
    expect(result).toEqual({ ok: false, reason: "insufficient-stock", available: 0 });
  });

  it("refuses more than the limit per line even when the stock allows it", async () => {
    const result = await changeCartQuantity({
      cartId: undefined,
      sku: "FV-50",
      quantity: 13,
      mode: "add",
      maxPerLine: MAX,
    });
    expect(result).toEqual({ ok: false, reason: "insufficient-stock", available: 12 });
  });
});

describe("changing a cart", () => {
  it("sets a quantity instead of adding to it", async () => {
    const cartId = await add(undefined, "FV-50", 5);

    const result = await changeCartQuantity({
      cartId,
      sku: "FV-50",
      quantity: 2,
      mode: "set",
      maxPerLine: MAX,
    });

    expect(result).toEqual({ ok: true, cartId });
    expect(await countCartItems(cartId)).toBe(2);
  });

  it("removes a line and leaves the others", async () => {
    const cartId = await add(undefined, "FV-50", 1);
    await add(cartId, "TN-180", 2);

    await removeCartLine(cartId, "FV-50");

    expect((await getCartLines(cartId, "fr")).map((line) => line.sku)).toEqual(["TN-180"]);
  });

  it("does nothing when removing a line that is not in the cart", async () => {
    const cartId = await add(undefined, "FV-50", 1);
    await removeCartLine(cartId, "TN-180");
    await removeCartLine(undefined, "FV-50");

    expect(await countCartItems(cartId)).toBe(1);
  });
});

describe("prices", () => {
  it("always reads the price from the catalogue, never from the cart", async () => {
    const cartId = await add(undefined, "FV-50", 2);
    await client.query("update variants set price_cents = 2600 where sku = 'FV-50'");

    const [line] = await getCartLines(cartId, "fr");
    expect(line?.unitPriceCents).toBe(2600);
  });
});

describe("isolation between visitors", () => {
  it("never shows or changes the lines of another cart", async () => {
    const mine = await add(undefined, "FV-50", 1);
    const theirs = await add(undefined, "TN-180", 4);

    await removeCartLine(mine, "TN-180");

    expect((await getCartLines(mine, "fr")).map((line) => line.sku)).toEqual(["FV-50"]);
    expect(await countCartItems(theirs)).toBe(4);
  });

  it("returns an empty cart for an unknown or malformed identifier", async () => {
    expect(await getCartLines(undefined, "fr")).toEqual([]);
    expect(await getCartLines("not-a-uuid", "fr")).toEqual([]);
    expect(await countCartItems("00000000-0000-4000-8000-000000000000")).toBe(0);
  });
});

describe("database rules", () => {
  it("refuses a quantity outside 1 to 12 at the database level", async () => {
    const cartId = await add(undefined, "FV-50", 1);

    await expect(
      client.query("update cart_items set quantity = 0 where cart_id = $1", [cartId]),
    ).rejects.toMatchObject({ code: "23514" });
    await expect(
      client.query("update cart_items set quantity = 13 where cart_id = $1", [cartId]),
    ).rejects.toMatchObject({ code: "23514" });
  });
});
