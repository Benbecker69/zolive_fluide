import "server-only";

import { and, asc, desc, eq, type SQL } from "drizzle-orm";

import { getDb } from "./db";
import { categories, products, variants } from "./schema";

/**
 * Read access to the catalogue. The catalogue is public: no authorization applies here.
 * Functions return minimal objects in the requested language, never database rows.
 */

export type CatalogueLocale = "fr" | "en";

export type ProductSort = "featured" | "price-asc" | "price-desc" | "name";

export type CategorySummary = {
  slug: string;
  name: string;
};

export type ProductSummary = {
  slug: string;
  name: string;
  tagline: string;
  tint: (typeof products.$inferSelect)["tint"];
  packshot: (typeof products.$inferSelect)["packshot"];
  label: string;
  isNewHarvest: boolean;
  /** Default format and its price, shown on the tile. */
  format: string;
  priceCents: number;
};

export async function listCategories(locale: CatalogueLocale): Promise<CategorySummary[]> {
  const name = locale === "fr" ? categories.nameFr : categories.nameEn;
  return getDb()
    .select({ slug: categories.slug, name })
    .from(categories)
    .orderBy(asc(categories.position));
}

type ListProductsOptions = {
  locale: CatalogueLocale;
  /** Category slug; when absent, every category is listed. */
  category?: string;
  sort?: ProductSort;
};

export async function listProducts({
  locale,
  category,
  sort = "featured",
}: ListProductsOptions): Promise<ProductSummary[]> {
  const french = locale === "fr";
  const name = french ? products.nameFr : products.nameEn;

  const order: Record<ProductSort, SQL[]> = {
    featured: [asc(products.position)],
    "price-asc": [asc(variants.priceCents), asc(products.position)],
    "price-desc": [desc(variants.priceCents), asc(products.position)],
    name: [asc(name)],
  };

  return getDb()
    .select({
      slug: products.slug,
      name,
      tagline: french ? products.taglineFr : products.taglineEn,
      tint: products.tint,
      packshot: products.packshot,
      label: french ? products.labelFr : products.labelEn,
      isNewHarvest: products.isNewHarvest,
      format: variants.format,
      priceCents: variants.priceCents,
    })
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .innerJoin(variants, and(eq(variants.productId, products.id), eq(variants.isDefault, true)))
    .where(category ? eq(categories.slug, category) : undefined)
    .orderBy(...order[sort]);
}
