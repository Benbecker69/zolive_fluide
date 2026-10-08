/**
 * Formats an amount stored in cents for a language: "24 €" in French, "€24.00" in English.
 * Amounts stay integers until the very last moment; only the display divides by 100.
 */
export function formatPrice(cents: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    // Round prices are shown without decimals in French, as on the mockup.
    minimumFractionDigits: locale.startsWith("fr") && cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

/**
 * Price per litre in cents, rounded to the cent, for a format sold by volume.
 * Returns null for a product sold by weight.
 */
export function pricePerLitreCents(priceCents: number, volumeMl: number | null): number | null {
  if (volumeMl === null || volumeMl <= 0) return null;
  return Math.round((priceCents * 1000) / volumeMl);
}
