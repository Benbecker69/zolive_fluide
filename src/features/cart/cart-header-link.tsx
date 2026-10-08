"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { usePathname } from "@/i18n/navigation";
import { CartLink } from "@/ui/site-chrome";

import { CART_CHANGED } from "./cart-events";

/**
 * Cart link of the header. The pages around it are served from a cache shared by all
 * visitors, so the count cannot be rendered with them: it is fetched for this visitor
 * once the page is displayed, and again whenever the cart changes.
 * Without JavaScript the link is still there, without its count.
 */
export function CartHeaderLink() {
  const t = useTranslations("cart");
  const pathname = usePathname();
  const [count, setCount] = useState<number>();

  useEffect(() => {
    const controller = new AbortController();

    async function refresh() {
      try {
        const response = await fetch("/api/cart/count", { signal: controller.signal });
        if (!response.ok) return;
        const body = (await response.json()) as { count: number };
        setCount(body.count);
      } catch {
        // The count is a convenience: on a network error the link stays usable without it.
      }
    }

    void refresh();
    window.addEventListener(CART_CHANGED, refresh);
    return () => {
      controller.abort();
      window.removeEventListener(CART_CHANGED, refresh);
    };
  }, [pathname]);

  return (
    <CartLink
      href="/panier"
      label={t("link")}
      count={count}
      countLabel={count === undefined ? undefined : t("linkWithCount", { count })}
    />
  );
}
