import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Catalogue schema (docs/project/architecture.md, docs/adr/0003-postgresql-drizzle.md).
 *
 * - Prices are integers, in cents: no floating point arithmetic on money.
 * - Stock cannot become negative: the database enforces it, even under concurrent orders.
 * - Names and descriptions are translated in columns, because they are data, not interface text.
 *
 * This file has no server-only marker on purpose: the migration generator loads it outside Next.js.
 */

export const tint = pgEnum("tint", ["sage", "zest", "sky", "peach"]);

export const packshotKind = pgEnum("packshot_kind", [
  "bottle",
  "bottle-dark",
  "tin",
  "jar",
  "jar-dark",
  "vinegar",
  "box",
]);

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  nameFr: text("name_fr").notNull(),
  nameEn: text("name_en").notNull(),
  position: integer("position").notNull(),
});

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    nameFr: text("name_fr").notNull(),
    nameEn: text("name_en").notNull(),
    /** Short line under the name: variety or character. */
    taglineFr: text("tagline_fr").notNull(),
    taglineEn: text("tagline_en").notNull(),
    descriptionFr: text("description_fr").notNull(),
    descriptionEn: text("description_en").notNull(),
    tint: tint("tint").notNull(),
    packshot: packshotKind("packshot").notNull(),
    /** Text printed on the drawn label. */
    labelFr: text("label_fr").notNull(),
    labelEn: text("label_en").notNull(),
    isNewHarvest: boolean("is_new_harvest").notNull().default(false),
    isFeatured: boolean("is_featured").notNull().default(false),
    /** Tasting profile from 1 to 5; null for products that are not olive oils. */
    fruitiness: smallint("fruitiness"),
    bitterness: smallint("bitterness"),
    pungency: smallint("pungency"),
    position: integer("position").notNull(),
  },
  (table) => [
    index("products_category_idx").on(table.categoryId),
    check(
      "products_profile_range",
      sql`(${table.fruitiness} is null or ${table.fruitiness} between 1 and 5)
        and (${table.bitterness} is null or ${table.bitterness} between 1 and 5)
        and (${table.pungency} is null or ${table.pungency} between 1 and 5)`,
    ),
  ],
);

export const variants = pgTable(
  "variants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    sku: text("sku").notNull().unique(),
    /** Format as displayed, identical in both languages: "50 cl", "1 L", "180 g". */
    format: text("format").notNull(),
    /** Volume in millilitres, to compute the price per litre; null for products sold by weight. */
    volumeMl: integer("volume_ml"),
    priceCents: integer("price_cents").notNull(),
    stock: integer("stock").notNull(),
    isDefault: boolean("is_default").notNull().default(false),
    position: integer("position").notNull(),
  },
  (table) => [
    index("variants_product_idx").on(table.productId),
    check("variants_price_positive", sql`${table.priceCents} > 0`),
    check("variants_stock_not_negative", sql`${table.stock} >= 0`),
    check("variants_volume_positive", sql`${table.volumeMl} is null or ${table.volumeMl} > 0`),
  ],
);

/**
 * Shopping cart. Its identifier is random and is the only thing stored in the visitor's
 * cookie: whoever holds it owns the cart. A cart never stores a price: amounts are always
 * read from the catalogue.
 */
export const carts = pgTable("carts", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const cartItems = pgTable(
  "cart_items",
  {
    cartId: uuid("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => variants.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.cartId, table.variantId] }),
    check("cart_items_quantity_range", sql`${table.quantity} between 1 and 12`),
  ],
);

/**
 * Failed sign-in attempts per account (docs/adr/0014-sign-in-throttling.md).
 * The account is a fingerprint of the e-mail typed, never the address itself.
 */
export const signInThrottles = pgTable(
  "sign_in_throttles",
  {
    account: text("account").primaryKey(),
    failures: integer("failures").notNull(),
    windowStartedAt: timestamp("window_started_at", { withTimezone: true }).notNull(),
    lockedUntil: timestamp("locked_until", { withTimezone: true }),
  },
  (table) => [check("sign_in_throttles_failures_not_negative", sql`${table.failures} >= 0`)],
);

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  variants: many(variants),
}));

export const variantsRelations = relations(variants, ({ one }) => ({
  product: one(products, { fields: [variants.productId], references: [products.id] }),
}));
