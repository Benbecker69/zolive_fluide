import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { CartView } from "@/features/cart/cart-view";
import { routing } from "@/i18n/routing";

// The cart belongs to one visitor: it is rendered for each request and never indexed.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/panier">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "cart" });
  return { title: t("metaTitle"), robots: { index: false } };
}

export default async function CartPage({ params }: PageProps<"/[locale]/panier">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return <CartView locale={locale} />;
}
