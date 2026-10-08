import { getTranslations } from "next-intl/server";

import type { CatalogueLocale } from "@/data/catalogue";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/money";
import { Breadcrumb } from "@/ui/breadcrumb";
import { Button, ButtonLink } from "@/ui/button";

import { removeFromCartAction } from "./actions";
import { CartLineQuantity } from "./cart-line-quantity";
import { getCart } from "./get-cart";

/**
 * The visitor's cart. Every amount on this page is computed on the server from the
 * catalogue: nothing here comes from the browser.
 */
export async function CartView({ locale }: { locale: CatalogueLocale }) {
  const t = await getTranslations("cart");
  const cart = await getCart(locale);

  return (
    <div className="mx-auto flex max-w-page flex-col px-5 pt-6 sm:px-8 lg:px-12">
      <Breadcrumb
        label={t("breadcrumb")}
        items={[{ label: t("home"), href: "/" }, { label: t("title") }]}
      />
      <h1 className="mt-3 text-[clamp(2.75rem,5.4vw,4.75rem)] leading-none tracking-[-0.045em]">
        {t("title")}
      </h1>

      {cart.lines.length === 0 ? (
        <div className="mt-10 flex flex-col items-start gap-6 border-t border-line pt-10">
          <p className="text-lg">{t("empty")}</p>
          <ButtonLink href="/boutique" withArrow>
            {t("goToShop")}
          </ButtonLink>
        </div>
      ) : (
        <div className="mt-10 grid items-start gap-x-16 gap-y-10 lg:grid-cols-[1.6fr_1fr]">
          <ul className="flex flex-col border-b border-line">
            {cart.lines.map((line) => {
              const lineName = `${line.name}, ${line.format}`;
              return (
                <li
                  key={line.sku}
                  className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-t border-line py-6"
                >
                  <div className="flex min-w-48 flex-1 flex-col gap-1">
                    <h2 className="text-2xl tracking-[-0.02em]">
                      <Link href={`/produits/${line.productSlug}`} className="hover:opacity-80">
                        {line.name}
                      </Link>
                    </h2>
                    <p className="text-[0.9375rem] text-muted">
                      {t("lineDetail", {
                        format: line.format,
                        price: formatPrice(line.unitPriceCents, locale),
                      })}
                    </p>
                  </div>
                  <CartLineQuantity
                    sku={line.sku}
                    lineName={lineName}
                    quantity={line.quantity}
                    max={line.maxQuantity}
                  />
                  <p className="w-24 text-right text-lg font-semibold">
                    {formatPrice(line.totalCents, locale)}
                  </p>
                  <form action={removeFromCartAction}>
                    <input type="hidden" name="sku" value={line.sku} />
                    <Button
                      type="submit"
                      variant="outline"
                      className="h-11 px-5"
                      aria-label={t("removeLine", { line: lineName })}
                    >
                      {t("remove")}
                    </Button>
                  </form>
                </li>
              );
            })}
          </ul>

          <section
            aria-labelledby="summary-title"
            className="flex flex-col gap-5 rounded-card bg-tint-sage p-8"
          >
            <h2 id="summary-title" className="text-3xl">
              {t("summary")}
            </h2>
            <dl className="flex flex-col gap-3 text-[1.0625rem]">
              <div className="flex justify-between gap-4">
                <dt>{t("items", { count: cart.itemCount })}</dt>
                <dd className="font-semibold">{formatPrice(cart.subtotalCents, locale)}</dd>
              </div>
              <div className="flex justify-between gap-4 text-muted">
                <dt>{t("shipping")}</dt>
                <dd>{t("shippingLater")}</dd>
              </div>
            </dl>
            <p className="border-t border-control-line pt-5 text-sm text-muted">
              {t("pricesNote")}
            </p>
            <ButtonLink href="/boutique" variant="outline">
              {t("continueShopping")}
            </ButtonLink>
          </section>
        </div>
      )}
    </div>
  );
}
