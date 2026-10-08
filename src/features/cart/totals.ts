/** Largest quantity of one format in a cart, whatever the stock. */
export const MAX_QUANTITY_PER_LINE = 12;

type PricedLine = { unitPriceCents: number; quantity: number };

/** Amount of one line, in cents. */
export function lineTotalCents(line: PricedLine): number {
  return line.unitPriceCents * line.quantity;
}

/** Number of items and amount of a cart, in cents. Amounts stay integers end to end. */
export function summarize(lines: readonly PricedLine[]): {
  itemCount: number;
  subtotalCents: number;
} {
  return lines.reduce(
    (summary, line) => ({
      itemCount: summary.itemCount + line.quantity,
      subtotalCents: summary.subtotalCents + lineTotalCents(line),
    }),
    { itemCount: 0, subtotalCents: 0 },
  );
}

/** Largest quantity a visitor may hold for a format, given its stock. */
export function maxQuantityFor(stock: number): number {
  return Math.max(0, Math.min(stock, MAX_QUANTITY_PER_LINE));
}
