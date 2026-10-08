import { describe, expect, it } from "vitest";

import { clampQuantity } from "./quantity";

describe("clampQuantity", () => {
  it.each([
    [3, 3],
    [0, 1],
    [-4, 1],
    [99, 12],
    [2.9, 2],
    [Number.NaN, 1],
    [Number.POSITIVE_INFINITY, 1],
  ])("turns %s into %s for the range 1 to 12", (value, expected) => {
    expect(clampQuantity(value, 1, 12)).toBe(expected);
  });
});
