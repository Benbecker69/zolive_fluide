import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { listCategories, listProducts } from "@/data/catalogue";
import { getPool } from "@/data/db";

import { seed } from "../../scripts/db/seed.mjs";
import { TEST_DATABASE_URL } from "./test-database";

beforeAll(async () => {
  await seed(TEST_DATABASE_URL);
});

afterAll(async () => {
  await getPool().end();
});

describe("listCategories", () => {
  it("returns the categories in their display order, in the requested language", async () => {
    expect(await listCategories("fr")).toEqual([
      { slug: "huiles-d-olive", name: "Huiles d'olive" },
      { slug: "olives-et-tapenades", name: "Olives et tapenades" },
      { slug: "vinaigres-et-condiments", name: "Vinaigres et condiments" },
      { slug: "coffrets", name: "Coffrets" },
    ]);
    expect((await listCategories("en")).map((category) => category.name)).toEqual([
      "Olive oils",
      "Olives and tapenades",
      "Vinegars and condiments",
      "Gift boxes",
    ]);
  });
});

describe("listProducts", () => {
  it("lists every product once, with its default format and price", async () => {
    const products = await listProducts({ locale: "fr" });

    expect(products).toHaveLength(9);
    expect(products[0]).toEqual({
      slug: "fruite-vert",
      name: "Fruité vert",
      tagline: "Picholine",
      tint: "sage",
      packshot: "bottle",
      label: "fruité vert",
      isNewHarvest: true,
      format: "50 cl",
      priceCents: 2400,
    });
  });

  it("returns names, taglines and labels in English", async () => {
    const [first] = await listProducts({ locale: "en" });
    expect(first).toMatchObject({ name: "Green fruity", label: "green fruity" });
  });

  it("filters by category", async () => {
    const products = await listProducts({ locale: "fr", category: "olives-et-tapenades" });
    expect(products.map((product) => product.slug)).toEqual([
      "olives-vertes-cassees",
      "tapenade-noire",
    ]);
  });

  it("returns nothing for a category that does not exist", async () => {
    expect(await listProducts({ locale: "fr", category: "voitures" })).toEqual([]);
  });

  it("sorts by ascending and descending price", async () => {
    const ascending = await listProducts({ locale: "fr", sort: "price-asc" });
    const prices = ascending.map((product) => product.priceCents);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));

    const descending = await listProducts({ locale: "fr", sort: "price-desc" });
    expect(descending.map((product) => product.priceCents)).toEqual([...prices].reverse());
  });

  it("sorts by name in the requested language", async () => {
    const names = (await listProducts({ locale: "en", sort: "name" })).map(
      (product) => product.name,
    );
    expect(names[0]).toBe("Black fruity");
    expect(names).toHaveLength(9);
  });
});
