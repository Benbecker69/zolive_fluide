import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

/** Locale-aware navigation: links keep the current language unless told otherwise. */
export const { Link, redirect, usePathname } = createNavigation(routing);
