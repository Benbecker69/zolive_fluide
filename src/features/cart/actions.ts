"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { changeCartQuantity, removeCartLine } from "@/data/cart";

import { readCartId, writeCartId } from "./cart-cookie";
import { MAX_QUANTITY_PER_LINE } from "./totals";

/**
 * Cart mutations. Server actions are public entry points: every input is validated here,
 * the cart identifier only ever comes from the visitor's cookie, and nothing but a status
 * is returned to the browser.
 */

export type CartActionState =
  | { status: "idle" }
  | { status: "added"; quantity: number }
  | { status: "updated" }
  | { status: "invalid" }
  | { status: "unknown-product" }
  | { status: "insufficient-stock"; available: number };

const lineSchema = z.object({
  sku: z.string().regex(/^[A-Z0-9-]{2,24}$/),
  quantity: z.coerce.number().int().min(1).max(MAX_QUANTITY_PER_LINE),
});

const skuSchema = lineSchema.pick({ sku: true });

async function change(formData: FormData, mode: "add" | "set"): Promise<CartActionState> {
  const parsed = lineSchema.safeParse({
    sku: formData.get("sku"),
    quantity: formData.get("quantity"),
  });
  if (!parsed.success) return { status: "invalid" };

  const result = await changeCartQuantity({
    cartId: await readCartId(),
    sku: parsed.data.sku,
    quantity: parsed.data.quantity,
    mode,
    maxPerLine: MAX_QUANTITY_PER_LINE,
  });
  if (!result.ok) {
    return result.reason === "insufficient-stock"
      ? { status: "insufficient-stock", available: result.available }
      : { status: "unknown-product" };
  }

  await writeCartId(result.cartId);
  revalidatePath("/[locale]/panier", "page");
  return mode === "add"
    ? { status: "added", quantity: parsed.data.quantity }
    : { status: "updated" };
}

export async function addToCartAction(
  _previous: CartActionState,
  formData: FormData,
): Promise<CartActionState> {
  return change(formData, "add");
}

export async function setCartQuantityAction(
  _previous: CartActionState,
  formData: FormData,
): Promise<CartActionState> {
  return change(formData, "set");
}

export async function removeFromCartAction(formData: FormData): Promise<void> {
  const parsed = skuSchema.safeParse({ sku: formData.get("sku") });
  if (!parsed.success) return;

  await removeCartLine(await readCartId(), parsed.data.sku);
  revalidatePath("/[locale]/panier", "page");
}
