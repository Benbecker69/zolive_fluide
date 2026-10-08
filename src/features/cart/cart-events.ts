/** Browser event sent when the cart changes, so the header can refresh its count. */
export const CART_CHANGED = "zolive:cart-changed";

export function announceCartChange(): void {
  window.dispatchEvent(new Event(CART_CHANGED));
}
