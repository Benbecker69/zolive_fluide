import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { getProduct, listRelatedProducts } from "@/data/catalogue";
import { getPool } from "@/data/db";

import { seed } from "../../scripts/db/seed.mjs";
import { TEST_DATABASE_URL } from "./test-database";

beforeAll(async () => {
  await seed(TEST_DATABASE_URL);
});

afterAll(async () => {
  await getPool().end();
});

describe("getProduct", () => {
  it("returns a product with its category, tasting profile and formats in display order", async () => {
    const product = await getProduct("fr", "fruite-vert");

    expect(product).toMatchObject({
      slug: "fruite-vert",
      name: "Fruité vert",
      category: { slug: "huiles-d-olive", name: "Huiles d'olive" },
      profile: { fruitiness: 5, bitterness: 3, pungency: 4 },
    });
    expect(
      product?.formats.map((format) => [format.format, format.priceCents, format.isDefault]),
    ).toEqual([
      ["25 cl", 1400, false],
      ["50 cl", 2400, true],
      ["75 cl", 3300, false],
    ]);
  });

  it("returns the English texts on request", async () => {
    const product = await getProduct("en", "fruite-vert");
    expect(product).toMatchObject({ name: "Green fruity", category: { name: "Olive oils" } });
    expect(product?.description).toContain("Olives picked while still green");
  });

  it("has no tasting profile for a product that is not an olive oil", async () => {
    expect((await getProduct("fr", "tapenade-noire"))?.profile).toBeNull();
  });

  it("exposes the stock of each format, including a format out of stock", async () => {
    const product = await getProduct("fr", "fruite-noir");
    expect(product?.formats.map((format) => [format.sku, format.stock])).toEqual([
      ["FN-50", 30],
      ["FN-75", 0],
    ]);
  });

  it("returns null for an unknown product", async () => {
    expect(await getProduct("fr", "does-not-exist")).toBeNull();
  });
});

describe("listRelatedProducts", () => {
  it("suggests products of the same category first and never the product itself", async () => {
    const related = await listRelatedProducts("fr", "fruite-mur", 4);

    expect(related.map((product) => product.slug)).toEqual([
      "fruite-vert",
      "fruite-noir",
      "le-bidon",
      "huile-au-citron",
    ]);
  });

  it("completes with the rest of the catalogue when the category is too small", async () => {
    const related = await listRelatedProducts("fr", "coffret-decouverte", 4);

    expect(related).toHaveLength(4);
    expect(related.map((product) => product.slug)).not.toContain("coffret-decouverte");
  });
});
