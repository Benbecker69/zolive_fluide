import { describe, expect, it } from "vitest";

import { lineTotalCents, maxQuantityFor, MAX_QUANTITY_PER_LINE, summarize } from "./totals";

describe("lineTotalCents", () => {
  it("multiplies the unit price by the quantity", () => {
    expect(lineTotalCents({ unitPriceCents: 2400, quantity: 3 })).toBe(7200);
  });
});

describe("summarize", () => {
  it("is empty for an empty cart", () => {
    expect(summarize([])).toEqual({ itemCount: 0, subtotalCents: 0 });
  });

  it("adds up quantities and amounts", () => {
    expect(
      summarize([
        { unitPriceCents: 2400, quantity: 2 },
        { unitPriceCents: 900, quantity: 1 },
        { unitPriceCents: 1450, quantity: 3 },
      ]),
    ).toEqual({ itemCount: 6, subtotalCents: 4800 + 900 + 4350 });
  });

  it("stays exact on amounts that floating point would distort", () => {
    // 0.1 + 0.2 !== 0.3 in floating point; in integer cents the sum is exact.
    expect(
      summarize([
        { unitPriceCents: 10, quantity: 1 },
        { unitPriceCents: 20, quantity: 1 },
      ]).subtotalCents,
    ).toBe(30);
  });
});

describe("maxQuantityFor", () => {
  it.each([
    [0, 0],
    [3, 3],
    [MAX_QUANTITY_PER_LINE, MAX_QUANTITY_PER_LINE],
    [500, MAX_QUANTITY_PER_LINE],
    [-2, 0],
  ])("allows at most %i -> %i for that stock", (stock, expected) => {
    expect(maxQuantityFor(stock)).toBe(expected);
  });
});
