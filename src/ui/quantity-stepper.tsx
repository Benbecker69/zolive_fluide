"use client";

import { useState } from "react";

import { clampQuantity } from "@/lib/quantity";

import { MinusIcon, PlusIcon } from "./icons";

type QuantityStepperProps = {
  /** Name of the form field that carries the value. */
  name: string;
  min?: number;
  max: number;
  defaultValue?: number;
  /** Accessible names, provided by the caller so that the component stays language-agnostic. */
  labels: { group: string; decrease: string; increase: string };
  onChange?: (quantity: number) => void;
};

const stepButton =
  "flex size-11 items-center justify-center rounded-full hover:bg-tint-sage disabled:cursor-not-allowed disabled:opacity-40";

/** Quantity selector. The value travels in a hidden field, so it is submitted with the form. */
export function QuantityStepper({
  name,
  min = 1,
  max,
  defaultValue = 1,
  labels,
  onChange,
}: QuantityStepperProps) {
  const [quantity, setQuantity] = useState(() => clampQuantity(defaultValue, min, max));

  function change(next: number) {
    const clamped = clampQuantity(next, min, max);
    setQuantity(clamped);
    onChange?.(clamped);
  }

  return (
    <div
      role="group"
      aria-label={labels.group}
      className="inline-flex h-15 w-fit items-center rounded-full border-[1.5px] border-control-line bg-surface px-1.5"
    >
      <button
        type="button"
        aria-label={labels.decrease}
        disabled={quantity <= min}
        onClick={() => change(quantity - 1)}
        className={stepButton}
      >
        <MinusIcon size={16} />
      </button>
      <output aria-live="polite" className="w-9 text-center font-semibold">
        {quantity}
      </output>
      <button
        type="button"
        aria-label={labels.increase}
        disabled={quantity >= max}
        onClick={() => change(quantity + 1)}
        className={stepButton}
      >
        <PlusIcon size={16} />
      </button>
      <input type="hidden" name={name} value={quantity} />
    </div>
  );
}
