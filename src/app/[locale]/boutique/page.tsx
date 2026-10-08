import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ShopListing } from "@/features/catalogue/shop-listing";
import { routing } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/boutique">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "shop" });
  return { title: t("metaTitle") };
}

export default async function ShopPage({ params, searchParams }: PageProps<"/[locale]/boutique">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return <ShopListing locale={locale} searchParams={await searchParams} />;
}
