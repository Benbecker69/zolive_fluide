import { Link } from "@/i18n/navigation";
import type { ComponentProps, ReactNode } from "react";

import { ArrowRightIcon } from "./icons";

type Variant = "primary" | "accent" | "outline";

const base =
  "inline-flex items-center justify-center gap-3 rounded-full font-semibold whitespace-nowrap " +
  "transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "h-15 bg-ink px-7 text-base text-ground",
  accent: "h-13 bg-accent px-6 text-[0.9375rem] text-ink",
  outline: "h-13 border-[1.5px] border-ink px-6 text-[0.9375rem] text-ink",
};

function classes(variant: Variant, withArrow: boolean, className?: string): string {
  return [base, variants[variant], withArrow ? "pr-2.5" : "", className ?? ""].join(" ").trim();
}

/** Round badge with an arrow, shown at the end of the main call to action. */
function ArrowBadge() {
  return (
    <span className="flex size-10 items-center justify-center rounded-full bg-accent text-ink">
      <ArrowRightIcon size={18} />
    </span>
  );
}

type Shared = { variant?: Variant; withArrow?: boolean; children: ReactNode };

export function Button({
  variant = "primary",
  withArrow = false,
  className,
  children,
  type = "button",
  ...props
}: Shared & ComponentProps<"button">) {
  return (
    <button type={type} className={classes(variant, withArrow, className)} {...props}>
      {children}
      {withArrow ? <ArrowBadge /> : null}
    </button>
  );
}

/** Same appearance as `Button`, for navigation: a link stays a link. */
export function ButtonLink({
  variant = "primary",
  withArrow = false,
  className,
  children,
  ...props
}: Shared & ComponentProps<typeof Link>) {
  return (
    <Link className={classes(variant, withArrow, className)} {...props}>
      {children}
      {withArrow ? <ArrowBadge /> : null}
    </Link>
  );
}

/** Underlined text link, for secondary actions next to a button. */
export function TextLink({ className, children, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={`inline-flex min-h-11 items-center font-semibold underline decoration-[1.5px] underline-offset-[6px] hover:opacity-80 ${className ?? ""}`}
      {...props}
    >
      {children}
    </Link>
  );
}
