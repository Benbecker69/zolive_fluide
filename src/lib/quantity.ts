/** Keeps a requested quantity inside the allowed range; anything unreadable becomes the minimum. */
export function clampQuantity(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.trunc(value)));
}
