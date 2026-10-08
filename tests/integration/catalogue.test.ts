import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { getDb, getPool } from "@/data/db";

import { seed } from "../../scripts/db/seed.mjs";
import { TEST_DATABASE_URL } from "./test-database";

const client = new pg.Client({ connectionString: TEST_DATABASE_URL });

/** The catalogue as a visitor sees it, without generated identifiers. */
async function snapshot() {
  const { rows } = await client.query(
    `select c.slug as category, p.slug as product, p.position, v.sku, v.format, v.price_cents, v.stock, v.is_default
       from variants v
       join products p on p.id = v.product_id
       join categories c on c.id = p.category_id
      order by p.position, v.position`,
  );
  return rows;
}

/** PostgreSQL error code of a rejected statement, or null when it was accepted. */
async function rejection(sql: string): Promise<string | null> {
  try {
    await client.query("begin");
    await client.query(sql);
    return null;
  } catch (error) {
    return (error as { code?: string }).code ?? "unknown";
  } finally {
    await client.query("rollback");
  }
}

const CHECK_VIOLATION = "23514";
const INVALID_ENUM_VALUE = "22P02";
// A foreign key declared "on delete restrict" raises its own code, distinct from 23503.
const RESTRICT_VIOLATION = "23001";

beforeAll(async () => {
  await client.connect();
  await seed(TEST_DATABASE_URL);
});

afterAll(async () => {
  await client.end();
  await getPool().end();
});

describe("seed", () => {
  it("loads the four categories and nine products of the mockup", async () => {
    const categories = await client.query("select count(*)::int as n from categories");
    const products = await client.query("select count(*)::int as n from products");
    expect(categories.rows[0].n).toBe(4);
    expect(products.rows[0].n).toBe(9);
  });

  it("gives every product exactly one default format", async () => {
    const { rows } = await client.query(
      `select p.slug, count(*) filter (where v.is_default)::int as defaults
         from products p join variants v on v.product_id = p.id
        group by p.slug having count(*) filter (where v.is_default) <> 1`,
    );
    expect(rows).toEqual([]);
  });

  it("gives the same catalogue when run twice", async () => {
    const first = await snapshot();
    await seed(TEST_DATABASE_URL);
    expect(await snapshot()).toEqual(first);
  });

  it("leaves an existing catalogue untouched when asked to seed only if empty", async () => {
    await client.query("update variants set stock = 1 where sku = 'FV-50'");
    const result = await seed(TEST_DATABASE_URL, { ifEmpty: true });
    expect(result.skipped).toBe(true);
    const { rows } = await client.query("select stock from variants where sku = 'FV-50'");
    expect(rows[0].stock).toBe(1);
    await seed(TEST_DATABASE_URL);
  });
});

describe("constraints", () => {
  it("refuses a negative stock", async () => {
    expect(await rejection("update variants set stock = -1 where sku = 'FV-50'")).toBe(
      CHECK_VIOLATION,
    );
  });

  it("refuses a price of zero", async () => {
    expect(await rejection("update variants set price_cents = 0 where sku = 'FV-50'")).toBe(
      CHECK_VIOLATION,
    );
  });

  it("refuses a tasting note outside 1 to 5", async () => {
    expect(await rejection("update products set fruitiness = 6 where slug = 'fruite-vert'")).toBe(
      CHECK_VIOLATION,
    );
  });

  it("refuses a tint that is not in the style guide", async () => {
    expect(await rejection("update products set tint = 'purple' where slug = 'fruite-vert'")).toBe(
      INVALID_ENUM_VALUE,
    );
  });

  it("refuses to delete a category that still has products", async () => {
    expect(await rejection("delete from categories where slug = 'coffrets'")).toBe(
      RESTRICT_VIOLATION,
    );
  });
});

describe("schema mapping", () => {
  it("reads a product with its formats through the typed query builder", async () => {
    const product = await getDb().query.products.findFirst({
      where: (products, { eq }) => eq(products.slug, "fruite-vert"),
      with: {
        category: true,
        variants: { orderBy: (variants, { asc }) => asc(variants.position) },
      },
    });

    expect(product?.nameFr).toBe("Fruité vert");
    expect(product?.category.slug).toBe("huiles-d-olive");
    expect(product?.variants.map((variant) => [variant.format, variant.priceCents])).toEqual([
      ["25 cl", 1400],
      ["50 cl", 2400],
      ["75 cl", 3300],
    ]);
  });
});
