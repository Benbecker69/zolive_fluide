import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { routing } from "@/i18n/routing";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <div className="mx-auto flex max-w-page flex-col items-start gap-4 px-5 py-24 sm:px-8 lg:px-12">
      <h1 className="text-6xl">{t("title")}</h1>
      <p className="text-muted">{t("comingSoon")}</p>
    </div>
  );
}
