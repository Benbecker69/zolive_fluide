import { defineRouting } from "next-intl/routing";

/**
 * Supported languages (docs/adr/0005-next-intl-locale-prefix.md).
 * French is the reference language; the prefix is always present in the URL.
 */
export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "fr",
  localePrefix: "always",
});
