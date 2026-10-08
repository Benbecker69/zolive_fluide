import type messages from "../messages/fr.json";
import type { routing } from "./i18n/routing";

declare global {
  /** Shape of the message files; French is the reference. */
  type IntlMessages = typeof messages;
}

// Makes translation keys and locales type-checked: an unknown key is a compile error.
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: IntlMessages;
  }
}
