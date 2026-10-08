import "server-only";

import { and, asc, eq, isNull, sql } from "drizzle-orm";

import { user } from "./auth-schema";
import type { CatalogueLocale } from "./catalogue";
import { getDb } from "./db";
import { cartItems, carts, products, variants } from "./schema";

/**
 * Cart storage. Access rule: a cart belongs to whoever presents its identifier, which only
 * ever comes from the visitor's own cookie. Once the visitor signs in, the cart is also tied
 * to the account, and the cookie is given back at sign-out. No function here takes a price
 * from its caller: amounts are read from the catalogue each time.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type CartLine = {
  sku: string;
  productSlug: string;
  name: string;
  format: string;
  unitPriceCents: number;
  quantity: number;
  /** Units still available, so the interface can cap the quantity. */
  stock: number;
};

export type CartChange =
  | { ok: true; cartId: string }
  | { ok: false; reason: "unknown-product" }
  | { ok: false; reason: "insufficient-stock"; available: number };

/** Lines of a cart in the order they were added to the catalogue; empty for an unknown cart. */
export async function getCartLines(
  cartId: string | undefined,
  locale: CatalogueLocale,
): Promise<CartLine[]> {
  if (!cartId || !UUID.test(cartId)) return [];

  return getDb()
    .select({
      sku: variants.sku,
      productSlug: products.slug,
      name: locale === "fr" ? products.nameFr : products.nameEn,
      format: variants.format,
      unitPriceCents: variants.priceCents,
      quantity: cartItems.quantity,
      stock: variants.stock,
    })
    .from(cartItems)
    .innerJoin(variants, eq(variants.id, cartItems.variantId))
    .innerJoin(products, eq(products.id, variants.productId))
    .where(eq(cartItems.cartId, cartId))
    .orderBy(asc(products.position), asc(variants.position));
}

/** Total number of units in a cart; zero for an unknown cart. */
export async function countCartItems(cartId: string | undefined): Promise<number> {
  if (!cartId || !UUID.test(cartId)) return 0;

  const [row] = await getDb()
    .select({ count: sql<number>`coalesce(sum(${cartItems.quantity}), 0)::int` })
    .from(cartItems)
    .where(eq(cartItems.cartId, cartId));
  return row?.count ?? 0;
}

type QuantityChange = {
  cartId: string | undefined;
  sku: string;
  quantity: number;
  /** "add" increases the current quantity, "set" replaces it. */
  mode: "add" | "set";
  /** Upper bound per line, whatever the stock. */
  maxPerLine: number;
};

/**
 * Adds a format to a cart or sets its quantity, creating the cart when needed.
 * Everything happens in one transaction, with the format row locked: two concurrent
 * changes cannot both pass the stock check.
 */
export async function changeCartQuantity({
  cartId,
  sku,
  quantity,
  mode,
  maxPerLine,
}: QuantityChange): Promise<CartChange> {
  return getDb().transaction(async (tx) => {
    const [variant] = await tx
      .select({ id: variants.id, stock: variants.stock })
      .from(variants)
      .where(eq(variants.sku, sku))
      .for("update");
    if (!variant) return { ok: false, reason: "unknown-product" };

    // Resolve the cart without creating it yet: nothing is written before the stock check.
    let id: string | undefined;
    if (cartId && UUID.test(cartId)) {
      const [existing] = await tx.select({ id: carts.id }).from(carts).where(eq(carts.id, cartId));
      id = existing?.id;
    }

    let current = 0;
    if (id) {
      const [line] = await tx
        .select({ quantity: cartItems.quantity })
        .from(cartItems)
        .where(and(eq(cartItems.cartId, id), eq(cartItems.variantId, variant.id)));
      current = line?.quantity ?? 0;
    }

    const wanted = mode === "add" ? current + quantity : quantity;
    const available = Math.max(0, Math.min(variant.stock, maxPerLine));
    if (wanted < 1 || wanted > available) {
      return { ok: false, reason: "insufficient-stock", available };
    }

    if (!id) {
      const [created] = await tx.insert(carts).values({}).returning({ id: carts.id });
      if (!created) throw new Error("The cart could not be created");
      id = created.id;
    }

    await tx
      .insert(cartItems)
      .values({ cartId: id, variantId: variant.id, quantity: wanted })
      .onConflictDoUpdate({
        target: [cartItems.cartId, cartItems.variantId],
        set: { quantity: wanted },
      });
    await tx.update(carts).set({ updatedAt: new Date() }).where(eq(carts.id, id));

    return { ok: true, cartId: id } as const;
  });
}

/** Removes a format from a cart. Removing something that is not there is not an error. */
export async function removeCartLine(cartId: string | undefined, sku: string): Promise<void> {
  if (!cartId || !UUID.test(cartId)) return;

  const variant = getDb().select({ id: variants.id }).from(variants).where(eq(variants.sku, sku));
  await getDb()
    .delete(cartItems)
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.variantId, sql`(${variant})`)));
}

/**
 * Gives the guest cart of a visitor to the account they just signed in to, and returns the
 * cart the account now uses, if any.
 *
 * - The account has no cart: the guest cart becomes its cart.
 * - The account already has one: the guest lines are added to it, each quantity capped by the
 *   stock and by the limit per line, then the guest cart is deleted.
 *
 * Only a cart without owner can be adopted: a cart that belongs to another account is ignored.
 * `userId` comes from the authentication that has just succeeded, never from the browser.
 */
export async function adoptCart(
  guestCartId: string | undefined,
  userId: string,
  maxPerLine: number,
): Promise<string | undefined> {
  return getDb().transaction(async (tx) => {
    // Two sign-ins of the same account at the same moment wait for each other here, so both
    // cannot decide at once that the account has no cart yet.
    await tx.select({ id: user.id }).from(user).where(eq(user.id, userId)).for("update");
    const [owned] = await tx.select({ id: carts.id }).from(carts).where(eq(carts.userId, userId));

    let guest: { id: string } | undefined;
    if (guestCartId && UUID.test(guestCartId)) {
      [guest] = await tx
        .select({ id: carts.id })
        .from(carts)
        .where(and(eq(carts.id, guestCartId), isNull(carts.userId)))
        .for("update");
    }
    if (!guest) return owned?.id;

    if (!owned) {
      await tx.update(carts).set({ userId, updatedAt: new Date() }).where(eq(carts.id, guest.id));
      return guest.id;
    }

    const guestLines = await tx
      .select({
        variantId: cartItems.variantId,
        quantity: cartItems.quantity,
        stock: variants.stock,
      })
      .from(cartItems)
      .innerJoin(variants, eq(variants.id, cartItems.variantId))
      .where(eq(cartItems.cartId, guest.id));

    for (const line of guestLines) {
      const limit = Math.min(line.stock, maxPerLine);
      // A format that is no longer in stock is left out rather than blocking the sign-in.
      if (limit < 1) continue;
      await tx
        .insert(cartItems)
        .values({
          cartId: owned.id,
          variantId: line.variantId,
          quantity: Math.min(line.quantity, limit),
        })
        .onConflictDoUpdate({
          target: [cartItems.cartId, cartItems.variantId],
          set: { quantity: sql`least(${cartItems.quantity} + ${line.quantity}, ${limit})` },
        });
    }

    await tx.delete(carts).where(eq(carts.id, guest.id));
    await tx.update(carts).set({ updatedAt: new Date() }).where(eq(carts.id, owned.id));
    return owned.id;
  });
}
