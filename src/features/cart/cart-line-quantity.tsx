"use client";

import { useTranslations } from "next-intl";
import { useActionState, useEffect, useRef } from "react";

import { QuantityStepper } from "@/ui/quantity-stepper";

import { type CartActionState, setCartQuantityAction } from "./actions";
import { announceCartChange } from "./cart-events";

type CartLineQuantityProps = {
  sku: string;
  /** Product and format, to name the control: "Fruité vert, 50 cl". */
  lineName: string;
  quantity: number;
  max: number;
};

const idle: CartActionState = { status: "idle" };

/** Quantity of a cart line. A change is sent to the server at once; the page then shows the new totals. */
export function CartLineQuantity({ sku, lineName, quantity, max }: CartLineQuantityProps) {
  const t = useTranslations("cart");
  const form = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(setCartQuantityAction, idle);

  useEffect(() => {
    if (state.status === "updated") announceCartChange();
  }, [state]);

  return (
    <form ref={form} action={formAction} className="flex flex-col items-start gap-1">
      <input type="hidden" name="sku" value={sku} />
      <QuantityStepper
        // Remount when the server confirms another quantity than the one displayed.
        key={quantity}
        name="quantity"
        defaultValue={quantity}
        max={Math.max(max, quantity)}
        labels={{
          group: t("quantityOf", { line: lineName }),
          decrease: t("decrease"),
          increase: t("increase"),
        }}
        // The hidden field is updated by React first: submit once that render is done.
        onChange={() => setTimeout(() => form.current?.requestSubmit(), 0)}
      />
      <p role="status" className="text-sm font-semibold">
        {state.status === "insufficient-stock"
          ? t("insufficientStock", { count: state.available })
          : null}
      </p>
    </form>
  );
}
