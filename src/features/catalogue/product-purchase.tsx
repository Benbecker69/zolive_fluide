"use client";

import { useLocale, useTranslations } from "next-intl";
import { useActionState, useEffect, useState } from "react";

import { addToCartAction, type CartActionState } from "@/features/cart/actions";
import { announceCartChange } from "@/features/cart/cart-events";
import { Link } from "@/i18n/navigation";
import { formatPrice, pricePerLitreCents } from "@/lib/money";
import { Button } from "@/ui/button";
import { QuantityStepper } from "@/ui/quantity-stepper";

type Format = {
  sku: string;
  format: string;
  volumeMl: number | null;
  priceCents: number;
  stock: number;
  isDefault: boolean;
};

type ProductPurchaseProps = {
  formats: Format[];
  /** Largest quantity that can be chosen at once, whatever the stock. */
  maxQuantity: number;
};

const idle: CartActionState = { status: "idle" };

/**
 * Choice of a format and a quantity, with the price kept in sync, and the add-to-cart form.
 * Formats are native radio buttons in a fieldset: arrow keys, labels and form submission
 * work as usual. The amounts shown here are information for the visitor: the server reads
 * the price and the stock from the catalogue when the form is submitted.
 */
export function ProductPurchase({ formats, maxQuantity }: ProductPurchaseProps) {
  const t = useTranslations("product");
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(addToCartAction, idle);

  const firstAvailable =
    formats.find((format) => format.isDefault && format.stock > 0) ??
    formats.find((format) => format.stock > 0) ??
    formats[0];
  const [sku, setSku] = useState(firstAvailable?.sku);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (state.status === "added") announceCartChange();
  }, [state]);

  const selected = formats.find((format) => format.sku === sku) ?? firstAvailable;
  if (!selected) return null;

  const perLitre = pricePerLitreCents(selected.priceCents, selected.volumeMl);
  const purchasable = selected.stock > 0;

  return (
    <form action={formAction} className="flex flex-col gap-6 self-stretch">
      <p className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1" aria-live="polite">
        <span className="font-display text-4xl leading-none font-medium tracking-[-0.03em]">
          {formatPrice(selected.priceCents, locale)}
        </span>
        {perLitre !== null ? (
          <span className="text-[0.9375rem] text-muted">
            {t("perLitre", { price: formatPrice(perLitre, locale) })}
          </span>
        ) : null}
      </p>

      <fieldset>
        <legend className="mb-3 text-sm font-semibold">{t("format")}</legend>
        <div className="flex flex-wrap gap-2">
          {formats.map((format) => {
            const available = format.stock > 0;
            return (
              <label
                key={format.sku}
                className="relative flex h-13 min-w-22 cursor-pointer items-center justify-center gap-2 rounded-full border-[1.5px] border-control-line bg-surface px-5 text-[0.9375rem] font-semibold has-checked:border-ink has-checked:bg-ink has-checked:text-ground has-disabled:cursor-not-allowed has-disabled:opacity-60 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink"
              >
                <input
                  type="radio"
                  name="sku"
                  value={format.sku}
                  checked={format.sku === selected.sku}
                  disabled={!available}
                  onChange={() => {
                    setSku(format.sku);
                    setQuantity(1);
                  }}
                  className="absolute inset-0 cursor-[inherit] appearance-none rounded-full outline-none"
                />
                <span>{format.format}</span>
                {available ? null : <span className="font-medium">{t("unavailable")}</span>}
              </label>
            );
          })}
        </div>
      </fieldset>

      {purchasable ? (
        <div className="flex flex-wrap items-center gap-3">
          <QuantityStepper
            key={selected.sku}
            name="quantity"
            max={Math.min(selected.stock, maxQuantity)}
            labels={{
              group: t("quantity"),
              decrease: t("decrease"),
              increase: t("increase"),
            }}
            onChange={setQuantity}
          />
          <Button type="submit" disabled={pending} className="min-w-0 flex-[1_1_14rem]">
            <span>{t("addToCart")}</span>
            <span className="-mr-3 rounded-full bg-accent px-3.5 py-1.5 text-[0.9375rem] text-ink">
              {formatPrice(selected.priceCents * quantity, locale)}
            </span>
          </Button>
        </div>
      ) : null}

      <p role="status" className="min-h-6 text-[0.9375rem] font-semibold">
        {state.status === "added" ? (
          <>
            {t("added", { count: state.quantity })}{" "}
            <Link href="/panier" className="underline underline-offset-4 hover:opacity-80">
              {t("viewCart")}
            </Link>
          </>
        ) : null}
        {state.status === "insufficient-stock"
          ? t("insufficientStock", { count: state.available })
          : null}
        {state.status === "invalid" || state.status === "unknown-product" ? t("addFailed") : null}
      </p>
    </form>
  );
}
