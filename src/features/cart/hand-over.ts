import { adoptCart } from "@/data/cart";

import { clearCartId, readCartId, writeCartId } from "./cart-cookie";
import { MAX_QUANTITY_PER_LINE } from "./totals";

/**
 * Called right after a successful sign-in or sign-up: the cart filled as a guest joins the
 * account, and this device now points at the account's cart.
 */
export async function handCartOverTo(userId: string): Promise<void> {
  const cartId = await adoptCart(await readCartId(), userId, MAX_QUANTITY_PER_LINE);
  if (cartId) await writeCartId(cartId);
  else await clearCartId();
}

/**
 * Called at sign-out: the account's cart stays with the account and is no longer reachable
 * from this device, which matters on a shared computer.
 */
export async function leaveCartBehind(): Promise<void> {
  await clearCartId();
}
