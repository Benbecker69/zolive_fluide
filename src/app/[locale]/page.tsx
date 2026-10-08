import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import { HomePage } from "@/features/home/home-page";
import { routing } from "@/i18n/routing";

// Generated on first request, then served from the cache and refreshed at most once a
// minute (docs/adr/0013-on-demand-static-pages.md). The build needs no database.
export const revalidate = 60;

export function generateStaticParams() {
  return [];
}

export default async function Page({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return <HomePage locale={locale} />;
}
