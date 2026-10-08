import { listCategories, listProducts, type CatalogueLocale } from "@/data/catalogue";

import { parseListingParams } from "./listing-params";

type RawParams = Record<string, string | string[] | undefined>;

/** Everything the shop listing shows for a language and a set of URL parameters. */
export async function getListing(locale: CatalogueLocale, raw: RawParams) {
  const categories = await listCategories(locale);
  const params = parseListingParams(
    raw,
    categories.map((category) => category.slug),
  );
  const products = await listProducts({ locale, ...params });
  return { categories, params, products };
}
