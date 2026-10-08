import { countCartItems, getCartLines } from "@/data/cart";
import type { CatalogueLocale } from "@/data/catalogue";

import { readCartId } from "./cart-cookie";
import { lineTotalCents, maxQuantityFor, summarize } from "./totals";

/** The visitor's cart, priced from the catalogue, for display. */
export async function getCart(locale: CatalogueLocale) {
  const lines = await getCartLines(await readCartId(), locale);
  return {
    lines: lines.map((line) => ({
      ...line,
      totalCents: lineTotalCents(line),
      maxQuantity: maxQuantityFor(line.stock),
    })),
    ...summarize(lines),
  };
}

/** Number of units in the visitor's cart, for the header. */
export async function getCartCount(): Promise<number> {
  return countCartItems(await readCartId());
}
