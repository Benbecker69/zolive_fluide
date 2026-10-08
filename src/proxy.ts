import createMiddleware from "next-intl/middleware";

import { routing } from "@/i18n/routing";

/**
 * Language routing only: redirects to the visitor's language and adds the alternate links.
 * This file is never an access control (docs/adr/0002-nextjs-modular-monolith.md):
 * authorization lives in the data layer.
 */
export default createMiddleware(routing);

export const config = {
  // Every path except the API, Next.js internals and files with an extension.
  matcher: "/((?!api|_next|.*\\..*).*)",
};
