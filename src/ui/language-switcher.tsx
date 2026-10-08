"use client";

import { Link, usePathname } from "@/i18n/navigation";

type Language = { code: "fr" | "en"; name: string; short: string };

type LanguageSwitcherProps = {
  /** Accessible name of the group, in the current language. */
  label: string;
  current: string;
  languages: readonly Language[];
};

/**
 * Links to the same page in each language. Each link announces the language by its own
 * name and is marked with `lang`, so a screen reader pronounces it correctly.
 */
export function LanguageSwitcher({ label, current, languages }: LanguageSwitcherProps) {
  const pathname = usePathname();

  return (
    <nav aria-label={label}>
      <ul className="flex items-center gap-1 text-sm font-semibold">
        {languages.map((language) => {
          const selected = language.code === current;
          return (
            <li key={language.code}>
              <Link
                href={pathname}
                locale={language.code}
                lang={language.code}
                hrefLang={language.code}
                aria-label={language.name}
                aria-current={selected ? "true" : undefined}
                className={`flex size-11 items-center justify-center rounded-full hover:bg-tint-sage ${selected ? "bg-ink text-ground hover:bg-ink" : "text-ink"}`}
              >
                {language.short}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
