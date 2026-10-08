import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  smallint,
  text,
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
