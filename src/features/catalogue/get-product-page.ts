import { cache } from "react";
import { z } from "zod";

import { getProduct, listRelatedProducts, type CatalogueLocale } from "@/data/catalogue";

/** A slug comes from the URL: it is validated before it reaches the database. */
const slugSchema = z.string().regex(/^[a-z0-9-]{1,80}$/);

const RELATED_COUNT = 4;

/**
 * Everything the product page shows, or null when the product does not exist.
 * Cached for the duration of a render: the page and its metadata share one lookup.
 */
export const getProductPage = cache(async (locale: CatalogueLocale, slug: string) => {
  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) return null;

  const product = await getProduct(locale, parsed.data);
  if (!product) return null;

  const related = await listRelatedProducts(locale, product.slug, RELATED_COUNT);
  return { product, related };
});
