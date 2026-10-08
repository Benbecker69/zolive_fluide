import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import { getProductPage } from "@/features/catalogue/get-product-page";
import { ProductDetail } from "@/features/catalogue/product-detail";
import { routing } from "@/i18n/routing";

// Generated on first request, then served from the cache and refreshed at most once a
// minute (docs/adr/0013-on-demand-static-pages.md). The build needs no database.
export const revalidate = 60;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/produits/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const page = await getProductPage(locale, slug);
  if (!page) return {};
  return { title: `${page.product.name} — Zolive`, description: page.product.description };
}

export default async function ProductPage({ params }: PageProps<"/[locale]/produits/[slug]">) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const page = await getProductPage(locale, slug);
  if (!page) notFound();

  return <ProductDetail locale={locale} product={page.product} related={page.related} />;
}
