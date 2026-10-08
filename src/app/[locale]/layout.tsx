import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { routing } from "@/i18n/routing";
import { fontVariables } from "@/ui/fonts";
import { LanguageSwitcher } from "@/ui/language-switcher";
import { AnnouncementBar, SiteFooter, SiteHeader, SkipLink } from "@/ui/site-chrome";

import "../globals.css";

/** Display name of each language, written in that language. */
const LANGUAGES = [
  { code: "fr", name: "Français", short: "FR" },
  { code: "en", name: "English", short: "EN" },
] as const;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("title"), description: t("description") };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  // Lets the pages of this language be rendered statically.
  setRequestLocale(locale);

  const t = await getTranslations("chrome");
  const logo = { href: "/", label: t("homeLabel") };

  return (
    <html lang={locale} className={fontVariables}>
      <body>
        <NextIntlClientProvider>
          <SkipLink href="#content">{t("skipToContent")}</SkipLink>
          <AnnouncementBar>{t("announcement")}</AnnouncementBar>
          <SiteHeader
            logo={logo}
            nav={{ label: t("mainNav"), items: [{ href: "/boutique", label: t("navShop") }] }}
            actions={
              <LanguageSwitcher label={t("languageNav")} current={locale} languages={LANGUAGES} />
            }
          />
          <main id="content">{children}</main>
          <SiteFooter logo={logo} notice={t("notice")} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
