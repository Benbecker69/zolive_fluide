import { cookies } from "next/headers";

/**
 * The cart cookie holds one thing: the random identifier of the cart. No content, no price.
 * It is strictly necessary to the service the visitor asked for, so it needs no consent
 * (docs/audit/02-exigences-qualite.md, LEG-05).
 */
const CART_COOKIE = "zolive_cart";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

export async function readCartId(): Promise<string | undefined> {
  return (await cookies()).get(CART_COOKIE)?.value;
}

/** Stores the identifier. Only callable where the response can still be modified (actions, routes). */
export async function writeCartId(cartId: string): Promise<void> {
  (await cookies()).set(CART_COOKIE, cartId, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: THIRTY_DAYS,
  });
}

/** Forgets the cart on this device, for example when the customer signs out. */
export async function clearCartId(): Promise<void> {
  (await cookies()).delete(CART_COOKIE);
}
