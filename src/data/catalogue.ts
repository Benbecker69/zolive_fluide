import "server-only";

import { and, asc, desc, eq, ne, type SQL, sql } from "drizzle-orm";

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

type ProductFormat = {
  sku: string;
  format: string;
  /** Volume in millilitres; null for products sold by weight. */
  volumeMl: number | null;
  priceCents: number;
  stock: number;
  isDefault: boolean;
};

export type ProductDetail = Omit<ProductSummary, "format" | "priceCents"> & {
  description: string;
  category: CategorySummary;
  /** Tasting notes from 1 to 5; null for products that are not olive oils. */
  profile: { fruitiness: number; bitterness: number; pungency: number } | null;
  formats: ProductFormat[];
};

export async function listCategories(locale: CatalogueLocale): Promise<CategorySummary[]> {
  const name = locale === "fr" ? categories.nameFr : categories.nameEn;
  return getDb()
    .select({ slug: categories.slug, name })
    .from(categories)
    .orderBy(asc(categories.position));
}

/** Columns of a product tile, in the requested language. */
function summaryColumns(locale: CatalogueLocale) {
  const french = locale === "fr";
  return {
    slug: products.slug,
    name: french ? products.nameFr : products.nameEn,
    tagline: french ? products.taglineFr : products.taglineEn,
    tint: products.tint,
    packshot: products.packshot,
    label: french ? products.labelFr : products.labelEn,
    isNewHarvest: products.isNewHarvest,
    format: variants.format,
    priceCents: variants.priceCents,
  };
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
  const columns = summaryColumns(locale);

  const order: Record<ProductSort, SQL[]> = {
    featured: [asc(products.position)],
    "price-asc": [asc(variants.priceCents), asc(products.position)],
    "price-desc": [desc(variants.priceCents), asc(products.position)],
    name: [asc(columns.name)],
  };

  return getDb()
    .select(columns)
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .innerJoin(variants, and(eq(variants.productId, products.id), eq(variants.isDefault, true)))
    .where(category ? eq(categories.slug, category) : undefined)
    .orderBy(...order[sort]);
}

/** A product with all its formats, or null when the slug matches nothing. */
export async function getProduct(
  locale: CatalogueLocale,
  slug: string,
): Promise<ProductDetail | null> {
  const french = locale === "fr";
  const product = await getDb().query.products.findFirst({
    where: eq(products.slug, slug),
    with: { category: true, variants: { orderBy: asc(variants.position) } },
  });
  if (!product) return null;

  const { fruitiness, bitterness, pungency } = product;
  return {
    slug: product.slug,
    name: french ? product.nameFr : product.nameEn,
    tagline: french ? product.taglineFr : product.taglineEn,
    description: french ? product.descriptionFr : product.descriptionEn,
    tint: product.tint,
    packshot: product.packshot,
    label: french ? product.labelFr : product.labelEn,
    isNewHarvest: product.isNewHarvest,
    category: {
      slug: product.category.slug,
      name: french ? product.category.nameFr : product.category.nameEn,
    },
    profile:
      fruitiness !== null && bitterness !== null && pungency !== null
        ? { fruitiness, bitterness, pungency }
        : null,
    formats: product.variants.map((variant) => ({
      sku: variant.sku,
      format: variant.format,
      volumeMl: variant.volumeMl,
      priceCents: variant.priceCents,
      stock: variant.stock,
      isDefault: variant.isDefault,
    })),
  };
}

/**
 * Other products to suggest on a product page: those of the same category first,
 * then the rest of the catalogue in its display order.
 */
export async function listRelatedProducts(
  locale: CatalogueLocale,
  slug: string,
  limit: number,
): Promise<ProductSummary[]> {
  const current = getDb()
    .select({ categoryId: products.categoryId })
    .from(products)
    .where(eq(products.slug, slug));

  return getDb()
    .select(summaryColumns(locale))
    .from(products)
    .innerJoin(variants, and(eq(variants.productId, products.id), eq(variants.isDefault, true)))
    .where(ne(products.slug, slug))
    .orderBy(desc(sql`${products.categoryId} = (${current})`), asc(products.position))
    .limit(limit);
}
