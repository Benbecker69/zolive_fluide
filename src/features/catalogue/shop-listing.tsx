import { getTranslations } from "next-intl/server";

import type { CatalogueLocale } from "@/data/catalogue";
import { formatPrice } from "@/lib/money";
import { Breadcrumb } from "@/ui/breadcrumb";
import { Button } from "@/ui/button";
import { FilterChip } from "@/ui/chip";
import { ProductCard } from "@/ui/product-card";
import { SelectField } from "@/ui/select-field";

import { getListing } from "./get-listing";
import { listingHref, SORT_OPTIONS } from "./listing-params";

type ShopListingProps = {
  locale: CatalogueLocale;
  searchParams: Record<string, string | string[] | undefined>;
};

/**
 * Shop listing: filter by category, sort, grid of products.
 * Filters are links and the sort is a GET form, so the page works without JavaScript
 * and every state of the list has its own URL.
 */
export async function ShopListing({ locale, searchParams }: ShopListingProps) {
  const t = await getTranslations("shop");
  const { categories, params, products } = await getListing(locale, searchParams);

  return (
    <div className="mx-auto flex max-w-page flex-col px-5 pt-6 sm:px-8 lg:px-12">
      <Breadcrumb
        label={t("breadcrumb")}
        items={[{ label: t("home"), href: "/" }, { label: t("shopCrumb") }]}
      />

      <div className="mt-3 flex flex-wrap items-end justify-between gap-x-12 gap-y-4">
        <h1 className="text-[clamp(2.75rem,5.4vw,4.75rem)] leading-none tracking-[-0.045em]">
          {t.rich("title", { em: (chunks) => <em>{chunks}</em> })}
        </h1>
        <p className="max-w-[40ch] pb-2 text-[1.0625rem] text-muted">{t("intro")}</p>
      </div>

      <div className="mt-10 mb-8 flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-t border-line pt-6">
        <ul aria-label={t("filterLabel")} className="flex flex-wrap items-center gap-2">
          <li>
            <FilterChip href={listingHref({ sort: params.sort })} selected={!params.category}>
              {t("all")}
            </FilterChip>
          </li>
          {categories.map((category) => (
            <li key={category.slug}>
              <FilterChip
                href={listingHref({ category: category.slug, sort: params.sort })}
                selected={params.category === category.slug}
              >
                {category.name}
              </FilterChip>
            </li>
          ))}
        </ul>

        <form method="get" className="flex flex-wrap items-center gap-3">
          {params.category ? <input type="hidden" name="category" value={params.category} /> : null}
          <SelectField
            label={t("sortLabel")}
            name="sort"
            defaultValue={params.sort}
            options={SORT_OPTIONS.map((value) => ({ value, label: t(`sort.${value}`) }))}
          />
          <Button type="submit" variant="outline" className="h-11 px-5">
            {t("sortApply")}
          </Button>
        </form>
      </div>

      <p role="status" className="mb-6 text-sm text-muted">
        {t("count", { count: products.length })}
      </p>

      {products.length === 0 ? (
        <p className="py-16 text-lg">{t("empty")}</p>
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(15.5rem,100%),1fr))] gap-x-5 gap-y-10">
          {products.map((product) => (
            <li key={product.slug}>
              <ProductCard
                href={`/produits/${product.slug}`}
                name={product.name}
                detail={`${product.tagline} · ${product.format}`}
                price={formatPrice(product.priceCents, locale)}
                tint={product.tint}
                tag={product.isNewHarvest ? t("newHarvest") : undefined}
                packshot={{
                  kind: product.packshot,
                  label: product.label,
                  detail: product.format.toUpperCase(),
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
