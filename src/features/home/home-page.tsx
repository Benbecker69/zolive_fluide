import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { type CatalogueLocale, listCategoryTiles, listFeaturedProducts } from "@/data/catalogue";
import { listingHref } from "@/features/catalogue/listing-params";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/money";
import { ButtonLink, TextLink } from "@/ui/button";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  DropIcon,
  ImageIcon,
  LockIcon,
  PackageIcon,
  PlusIcon,
  SunIcon,
} from "@/ui/icons";
import { Packshot } from "@/ui/packshots";
import { ProductCard, tintClass } from "@/ui/product-card";

const container = "mx-auto max-w-page px-5 sm:px-8 lg:px-12";
const sectionTitle = "text-[clamp(2.125rem,3.8vw,3.375rem)] leading-[1.02]";
const eyebrow = "text-xs leading-5 font-semibold tracking-[0.12em] uppercase";
const em = (chunks: ReactNode) => <em>{chunks}</em>;

/** Labelled placeholder for a photograph that only the merchant can provide. */
function PhotoPlaceholder({
  label,
  caption,
  className,
}: {
  label: string;
  caption: string;
  className: string;
}) {
  return (
    <div
      role="img"
      aria-label={`${label} — ${caption}`}
      className={`flex flex-col items-center justify-center gap-2 p-6 text-center ${className}`}
    >
      <ImageIcon size={28} />
      <span className={eyebrow}>{label}</span>
      <span className="max-w-[24ch] text-[0.9375rem]">{caption}</span>
    </div>
  );
}

const TASTES = [
  { key: "green", slug: "fruite-vert" },
  { key: "ripe", slug: "fruite-mur" },
  { key: "black", slug: "fruite-noir" },
] as const;

const STEPS = ["picked", "pressed", "bottled"] as const;

/**
 * Home page of the validated mockup. Categories and favourite products come from the
 * database; photographs are labelled placeholders.
 */
export async function HomePage({ locale }: { locale: CatalogueLocale }) {
  const t = await getTranslations("home");
  const [tiles, favourites] = await Promise.all([
    listCategoryTiles(locale),
    listFeaturedProducts(locale, 4),
  ]);
  const star = favourites[0];

  const reassurance = [
    { icon: <DropIcon />, text: t("reassurance.coldPressed") },
    { icon: <SunIcon />, text: t("reassurance.harvest") },
    { icon: <PackageIcon />, text: t("reassurance.parcel") },
    { icon: <LockIcon />, text: t("reassurance.payment") },
  ];

  return (
    <>
      <section className={`${container} flex flex-wrap items-center gap-14 pt-10 pb-22`}>
        <div className="flex min-w-0 flex-[1.15_1_32rem] flex-col items-start gap-7">
          <p className={`${eyebrow} rounded-full border border-ink px-3.5 py-1.5`}>
            {t("eyebrow")}
          </p>
          <h1 className="text-[clamp(2.75rem,6vw,5.5rem)] leading-[0.98] tracking-[-0.045em]">
            {t.rich("title", { em })}
          </h1>
          <p className="max-w-[46ch] text-[1.1875rem] text-muted">{t("intro")}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-7 gap-y-3">
            <ButtonLink href="/boutique" withArrow>
              {t("cta")}
            </ButtonLink>
            <TextLink href="/#moulin">{t("secondaryCta")}</TextLink>
          </div>
        </div>

        <div className="relative min-w-0 flex-[1_1_27rem]">
          <div className="relative aspect-[1/1.06] overflow-hidden rounded-block bg-tint-sage">
            <span
              aria-hidden="true"
              className="absolute top-[16%] left-[12%] aspect-square w-[76%] rounded-full bg-accent"
            />
            <div className="absolute inset-0 flex items-end justify-center gap-[5%]">
              <Packshot kind="tin" label={t("visual.ripe")} className="w-[30%]" />
              <Packshot kind="bottle" label={t("visual.green")} className="w-[25%]" />
              <Packshot kind="bottle" label={t("visual.lemon")} className="w-[17%]" />
            </div>
            {star ? (
              <Link
                href={`/produits/${star.slug}`}
                className="absolute top-5 left-5 flex items-center gap-4 rounded-full bg-surface py-2 pr-2 pl-5 hover:opacity-90"
              >
                <span className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold">
                    {star.name} · {star.format}
                  </span>
                  <span className="text-[0.8125rem] text-muted">
                    {formatPrice(star.priceCents, locale)}
                  </span>
                </span>
                <span className="flex size-11 items-center justify-center rounded-full bg-ink text-ground">
                  <PlusIcon size={18} />
                </span>
              </Link>
            ) : null}
          </div>
          <p className="absolute -top-6 right-6 flex size-32 -rotate-10 items-center justify-center rounded-full bg-ink text-center font-serif text-[1.625rem] leading-none text-accent italic">
            {t("sticker")}
          </p>
        </div>
      </section>

      <div className={container}>
        <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(13.75rem,100%),1fr))] gap-x-6 gap-y-4 border-y border-line py-6 text-[0.9375rem] font-medium">
          {reassurance.map((item) => (
            <li key={item.text} className="flex items-center gap-3">
              <span className="text-brand">{item.icon}</span>
              {item.text}
            </li>
          ))}
        </ul>
      </div>

      <section aria-labelledby="categories-title" className={`${container} pt-26`}>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <h2 id="categories-title" className={sectionTitle}>
            {t.rich("categoriesTitle", { em })}
          </h2>
          <Link
            href="/boutique"
            className="flex min-h-11 items-center gap-2 text-[0.9375rem] font-semibold hover:opacity-80"
          >
            {t("allShop")}
            <ArrowRightIcon size={18} />
          </Link>
        </div>
        <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(15.5rem,100%),1fr))] gap-5">
          {tiles.map((tile) => (
            <li key={tile.slug}>
              <Link
                href={listingHref({ category: tile.slug })}
                className={`flex aspect-[4/5] flex-col overflow-hidden rounded-card hover:opacity-90 ${tintClass[tile.tint]}`}
              >
                <span className="flex items-start justify-between gap-4 px-6 pt-6">
                  <span className="max-w-[10ch] font-display text-[1.75rem] leading-[1.08] font-medium tracking-[-0.035em]">
                    {tile.name}
                  </span>
                  <span className="flex size-11 flex-none items-center justify-center rounded-full bg-surface">
                    <ArrowUpRightIcon size={18} />
                  </span>
                </span>
                <span className="flex min-h-0 flex-1 items-end justify-center">
                  <Packshot kind={tile.packshot} label={tile.label} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="favourites-title" className={`${container} pt-26`}>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <h2 id="favourites-title" className={sectionTitle}>
            {t.rich("favouritesTitle", { em })}
          </h2>
          <Link
            href="/boutique"
            className="flex min-h-11 items-center gap-2 text-[0.9375rem] font-semibold hover:opacity-80"
          >
            {t("allProducts")}
            <ArrowRightIcon size={18} />
          </Link>
        </div>
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(15.5rem,100%),1fr))] gap-x-5 gap-y-10">
          {favourites.map((product) => (
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
      </section>

      <section
        id="moulin"
        aria-labelledby="mill-title"
        className={`${container} grid scroll-mt-6 items-center gap-18 pt-30 lg:grid-cols-2`}
      >
        <div className="relative pb-9">
          <PhotoPlaceholder
            label={t("photo")}
            caption={t("mill.photoOrchard")}
            className="aspect-[1/1.02] rounded-block bg-tint-sky text-muted"
          />
          <PhotoPlaceholder
            label={t("photo")}
            caption={t("mill.photoBread")}
            className="absolute right-5 bottom-0 aspect-square w-[42%] rounded-card border-8 border-ground bg-accent text-ink"
          />
        </div>
        <div className="flex flex-col items-start gap-6">
          <p className={`${eyebrow} text-brand`}>{t("mill.eyebrow")}</p>
          <h2 id="mill-title" className={sectionTitle}>
            {t.rich("mill.title", { em })}
          </h2>
          <p className="max-w-[48ch] text-[1.0625rem] text-muted">{t("mill.intro")}</p>
          <ol className="mt-2 flex flex-col self-stretch border-b border-line">
            {STEPS.map((step, index) => (
              <li key={step} className="flex gap-6 border-t border-line py-5">
                <span
                  aria-hidden="true"
                  className="w-9 flex-none font-serif text-2xl leading-7 text-brand italic"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-[1.0625rem] font-semibold">
                    {t(`mill.steps.${step}.title`)}
                  </span>
                  <span className="text-[0.9375rem] text-muted">
                    {t(`mill.steps.${step}.text`)}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="gout" aria-labelledby="taste-title" className={`${container} scroll-mt-6 pt-30`}>
        <div className="rounded-block bg-brand px-6 py-10 text-ground sm:px-10 lg:px-16 lg:py-18">
          <div className="mb-12 flex flex-col gap-4">
            <p className={`${eyebrow} text-accent`}>{t("taste.eyebrow")}</p>
            <h2 id="taste-title" className={sectionTitle}>
              {t.rich("taste.title", { em })}
            </h2>
          </div>
          <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(17.5rem,100%),1fr))] gap-5">
            {TASTES.map((taste) => (
              <li
                key={taste.key}
                className="flex flex-col gap-3 rounded-3xl border border-on-brand-muted/30 p-8"
              >
                <h3 className="text-[2rem] leading-[1.1]">
                  {t.rich(`taste.${taste.key}.name`, { em })}
                </h3>
                <p className="text-on-brand-muted">{t(`taste.${taste.key}.notes`)}</p>
                <p className="mt-3 flex flex-col gap-0.5 border-t border-on-brand-muted/30 pt-4">
                  <span className={`${eyebrow} text-on-brand-muted`}>{t("taste.atTable")}</span>
                  <span>{t(`taste.${taste.key}.pairings`)}</span>
                </p>
                <Link
                  href={`/produits/${taste.slug}`}
                  className="mt-2 flex min-h-11 items-center gap-2 text-[0.9375rem] font-semibold text-accent hover:opacity-80"
                >
                  {t(`taste.${taste.key}.link`)}
                  <ArrowRightIcon size={18} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
