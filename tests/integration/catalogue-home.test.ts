import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { listCategoryTiles, listFeaturedProducts } from "@/data/catalogue";
import { getPool } from "@/data/db";

import { seed } from "../../scripts/db/seed.mjs";
import { TEST_DATABASE_URL } from "./test-database";

beforeAll(async () => {
  await seed(TEST_DATABASE_URL);
});

afterAll(async () => {
  await getPool().end();
});

describe("listFeaturedProducts", () => {
  it("returns the featured products in display order, up to the limit", async () => {
    const featured = await listFeaturedProducts("fr", 4);
    expect(featured.map((product) => product.slug)).toEqual([
      "fruite-vert",
      "fruite-mur",
      "le-bidon",
      "tapenade-noire",
    ]);

    expect(await listFeaturedProducts("fr", 2)).toHaveLength(2);
  });

  it("carries the default format and its price", async () => {
    const [first] = await listFeaturedProducts("en", 1);
    expect(first).toMatchObject({ name: "Green fruity", format: "50 cl", priceCents: 2400 });
  });
});

describe("listCategoryTiles", () => {
  it("returns one tile per category, with the visual of its first product", async () => {
    expect(await listCategoryTiles("fr")).toEqual([
      {
        slug: "huiles-d-olive",
        name: "Huiles d'olive",
        tint: "sage",
        packshot: "bottle",
        label: "fruité vert",
      },
      {
        slug: "olives-et-tapenades",
        name: "Olives et tapenades",
        tint: "zest",
        packshot: "jar",
        label: "olives vertes",
      },
      {
        slug: "vinaigres-et-condiments",
        name: "Vinaigres et condiments",
        tint: "peach",
        packshot: "vinegar",
        label: "vinaigre",
      },
      { slug: "coffrets", name: "Coffrets", tint: "zest", packshot: "box", label: "le coffret" },
    ]);
  });

  it("returns names and labels in English", async () => {
    const tiles = await listCategoryTiles("en");
    expect(tiles.map((tile) => tile.name)).toEqual([
      "Olive oils",
      "Olives and tapenades",
      "Vinegars and condiments",
      "Gift boxes",
    ]);
  });
});
