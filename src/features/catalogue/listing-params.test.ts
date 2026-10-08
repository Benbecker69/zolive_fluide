import { describe, expect, it } from "vitest";

import { listingHref, parseListingParams } from "./listing-params";

const categories = ["huiles-d-olive", "coffrets"];

describe("parseListingParams", () => {
  it("returns the default list when nothing is asked", () => {
    expect(parseListingParams({}, categories)).toEqual({ category: undefined, sort: "featured" });
  });

  it("keeps a known category and a known sort", () => {
    expect(parseListingParams({ category: "coffrets", sort: "price-asc" }, categories)).toEqual({
      category: "coffrets",
      sort: "price-asc",
    });
  });

  it.each([
    ["an unknown category", { category: "voitures" }],
    ["a category with forbidden characters", { category: "'; drop table products; --" }],
    ["an empty category", { category: "" }],
    ["an unknown sort", { sort: "random" }],
  ])("falls back to the default for %s", (_, raw) => {
    expect(parseListingParams(raw, categories)).toEqual({ category: undefined, sort: "featured" });
  });

  it("keeps the first value of a repeated parameter", () => {
    expect(parseListingParams({ sort: ["name", "price-asc"] }, categories).sort).toBe("name");
  });
});

describe("listingHref", () => {
  it.each([
    [{}, "/boutique"],
    [{ sort: "featured" as const }, "/boutique"],
    [{ category: "coffrets" }, "/boutique?category=coffrets"],
    [{ category: "coffrets", sort: "name" as const }, "/boutique?category=coffrets&sort=name"],
  ])("builds %o as %s", (params, expected) => {
    expect(listingHref(params)).toBe(expected);
  });
});
