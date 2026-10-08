import { z } from "zod";

import type { ProductSort } from "@/data/catalogue";

export const SORT_OPTIONS = [
  "featured",
  "price-asc",
  "price-desc",
  "name",
] as const satisfies readonly ProductSort[];

/**
 * Query parameters of the shop listing. They come from the URL, so they are untrusted:
 * anything unknown falls back to the default list instead of raising an error.
 */
const listingSchema = z.object({
  category: z
    .string()
    .regex(/^[a-z0-9-]{1,60}$/)
    .optional()
    .catch(undefined),
  sort: z.enum(SORT_OPTIONS).catch("featured"),
});

export type ListingParams = { category?: string; sort: ProductSort };

type RawParams = Record<string, string | string[] | undefined>;

/** A repeated parameter (`?sort=a&sort=b`) keeps its first value. */
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export function parseListingParams(
  raw: RawParams,
  knownCategories: readonly string[],
): ListingParams {
  const parsed = listingSchema.parse({
    category: first(raw.category),
    sort: first(raw.sort) ?? "featured",
  });
  const category =
    parsed.category && knownCategories.includes(parsed.category) ? parsed.category : undefined;
  return { category, sort: parsed.sort };
}

/** Builds the URL of the listing for a filter and a sort, leaving defaults out of the URL. */
export function listingHref(params: Partial<ListingParams>): string {
  const query = new URLSearchParams();
  if (params.category) query.set("category", params.category);
  if (params.sort && params.sort !== "featured") query.set("sort", params.sort);
  const search = query.toString();
  return search ? `/boutique?${search}` : "/boutique";
}
