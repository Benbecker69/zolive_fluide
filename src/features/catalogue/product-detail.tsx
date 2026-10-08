import { getTranslations } from "next-intl/server";

import {
  type CatalogueLocale,
  type ProductDetail as Product,
  type ProductSummary,
} from "@/data/catalogue";
import { formatPrice } from "@/lib/money";
import { Breadcrumb } from "@/ui/breadcrumb";
import { Tag } from "@/ui/chip";
import { Packshot } from "@/ui/packshots";
import { ProductCard, tintClass } from "@/ui/product-card";

import { listingHref } from "./listing-params";
import { ProductPurchase } from "./product-purchase";

/** Largest quantity of one format in a single order. */
const MAX_QUANTITY = 12;

const SCALE = [1, 2, 3, 4, 5] as const;

/** One line of the tasting profile: a note out of five, readable as a sentence by a screen reader. */
function TastingScale({ label, note, name }: { label: string; note: number; name: string }) {
  return (
    <div role="img" aria-label={name} className="flex items-center gap-4 text-[0.9375rem]">
      <span className="w-24 flex-none font-semibold">{label}</span>
      <span className="flex flex-1 gap-1.5">
        {SCALE.map((step) => (
          <span
            key={step}
            className={`h-2.5 flex-1 rounded-full ${step <= note ? "bg-ink" : "bg-surface"}`}
          />
        ))}
      </span>
    </div>
  );
}

type ProductDetailProps = {
  locale: CatalogueLocale;
  product: Product;
  related: ProductSummary[];
};

export async function ProductDetail({ locale, product, related }: ProductDetailProps) {
  const t = await getTranslations("product");
  const defaultFormat = product.formats.find((format) => format.isDefault) ?? product.formats[0];

  return (
    <div className="mx-auto flex max-w-page flex-col px-5 pt-6 sm:px-8 lg:px-12">
      <Breadcrumb
        label={t("breadcrumb")}
        items={[
          { label: t("home"), href: "/" },
          { label: t("shop"), href: "/boutique" },
          { label: product.category.name, href: listingHref({ category: product.category.slug }) },
          { label: product.name },
        ]}
      />

      <div className="mt-4 grid items-start gap-x-18 gap-y-10 lg:grid-cols-[1.1fr_1fr]">
        <div
          className={`relative flex aspect-[1/1.05] items-end justify-center overflow-hidden rounded-block ${tintClass[product.tint]}`}
        >
          <span
            aria-hidden="true"
            className="absolute top-[17%] left-[14%] aspect-square w-[72%] rounded-full bg-accent"
          />
          <Packshot
            kind={product.packshot}
            label={product.label}
            detail={defaultFormat?.format.toUpperCase()}
            className="relative w-[27%]"
          />
          {product.isNewHarvest ? (
            <span className="absolute top-5 left-5">
              <Tag>{t("newHarvest")}</Tag>
            </span>
          ) : null}
        </div>

        <div className="flex flex-col items-start gap-6">
          <div className="flex flex-col gap-3">
            <p className="text-xs leading-5 font-semibold tracking-[0.12em] text-brand uppercase">
              {product.category.name}
            </p>
            <h1 className="text-[clamp(2.75rem,5.4vw,4.75rem)] leading-none tracking-[-0.045em]">
              {product.name}
            </h1>
            <p className="text-lg text-muted">{product.tagline}</p>
          </div>

          <p className="max-w-[48ch] text-[1.0625rem]">{product.description}</p>

          <ProductPurchase formats={product.formats} maxQuantity={MAX_QUANTITY} />
        </div>
      </div>

      {product.profile ? (
        <section
          aria-labelledby="tasting-title"
          className="mt-26 grid items-center gap-x-16 gap-y-8 rounded-block bg-tint-sage px-6 py-10 sm:px-10 lg:grid-cols-2 lg:px-16 lg:py-16"
        >
          <div className="flex flex-col gap-4">
            <h2 id="tasting-title" className="text-[clamp(2rem,3.4vw,3rem)] leading-[1.04]">
              {t.rich("tastingTitle", { em: (chunks) => <em>{chunks}</em> })}
            </h2>
            <p className="max-w-[44ch] text-ink">{t("tastingIntro")}</p>
          </div>
          <div className="flex flex-col gap-4.5">
            <TastingScale
              label={t("fruitiness")}
              note={product.profile.fruitiness}
              name={t("scale", { label: t("fruitiness"), note: product.profile.fruitiness })}
            />
            <TastingScale
              label={t("bitterness")}
              note={product.profile.bitterness}
              name={t("scale", { label: t("bitterness"), note: product.profile.bitterness })}
            />
            <TastingScale
              label={t("pungency")}
              note={product.profile.pungency}
              name={t("scale", { label: t("pungency"), note: product.profile.pungency })}
            />
          </div>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section aria-labelledby="related-title" className="mt-26 flex flex-col gap-10">
          <h2 id="related-title" className="text-[clamp(2.125rem,3.8vw,3.375rem)] leading-[1.02]">
            {t.rich("relatedTitle", { em: (chunks) => <em>{chunks}</em> })}
          </h2>
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(15.5rem,100%),1fr))] gap-x-5 gap-y-10">
            {related.map((item) => (
              <li key={item.slug}>
                <ProductCard
                  href={`/produits/${item.slug}`}
                  name={item.name}
                  detail={`${item.tagline} · ${item.format}`}
                  price={formatPrice(item.priceCents, locale)}
                  tint={item.tint}
                  tag={item.isNewHarvest ? t("newHarvest") : undefined}
                  packshot={{
                    kind: item.packshot,
                    label: item.label,
                    detail: item.format.toUpperCase(),
                  }}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
