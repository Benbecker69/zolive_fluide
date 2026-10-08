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
