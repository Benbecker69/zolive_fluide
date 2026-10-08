import { describe, expect, it } from "vitest";

import { formatPrice, pricePerLitreCents } from "./money";

// Intl separates the amount and the symbol with non-breaking spaces: compare on normalized text.
const plain = (text: string) => text.replace(/\s/g, " ");

describe("formatPrice", () => {
  it.each([
    [2400, "fr", "24 €"],
    [1450, "fr", "14,50 €"],
    [900, "fr", "9 €"],
    [2400, "en", "€24.00"],
    [1450, "en", "€14.50"],
    [123456, "fr", "1 234,56 €"],
    [123456, "en", "€1,234.56"],
  ])("formats %i cents in %s as %s", (cents, locale, expected) => {
    expect(plain(formatPrice(cents, locale))).toBe(expected);
  });
});

describe("pricePerLitreCents", () => {
  it.each([
    [2400, 500, 4800],
    [1400, 250, 5600],
    [3300, 750, 4400],
    [3600, 1000, 3600],
    [1000, 333, 3003],
  ])("gives %i cents for %i ml as %i cents per litre", (price, volume, expected) => {
    expect(pricePerLitreCents(price, volume)).toBe(expected);
  });

  it("gives nothing for a product sold by weight", () => {
    expect(pricePerLitreCents(900, null)).toBeNull();
  });
});
