import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { SignUpPage } from "@/features/account/account-pages";
import { routing } from "@/i18n/routing";

// Depends on the visitor's session: rendered for each request and never indexed.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/inscription">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "account" });
  return { title: t("signUp.metaTitle"), robots: { index: false } };
}

export default async function Page({ params }: PageProps<"/[locale]/inscription">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return <SignUpPage />;
}
