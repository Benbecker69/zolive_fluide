import { describe, expect, it } from "vitest";

import { formatPrice } from "./money";

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
