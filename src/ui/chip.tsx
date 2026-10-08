import { Link } from "@/i18n/navigation";
import type { ComponentProps, ReactNode } from "react";

type FilterChipProps = Omit<ComponentProps<typeof Link>, "className"> & {
  selected?: boolean;
  children: ReactNode;
};

/**
 * Filter of the shop listing. It is a link, so filtering works without JavaScript and the
 * filtered list has its own URL. The border uses the control token: 3:1 against the page.
 */
export function FilterChip({ selected = false, children, ...props }: FilterChipProps) {
  const state = selected
    ? "border-ink bg-ink font-semibold text-ground"
    : "border-control-line font-medium text-ink hover:border-ink";
  return (
    <Link
      aria-current={selected ? "true" : undefined}
      className={`inline-flex h-11 items-center rounded-full border-[1.5px] px-5 text-[0.9375rem] ${state}`}
      {...props}
    >
      {children}
    </Link>
  );
}

type TagTone = "dark" | "sage" | "accent";

const tones: Record<TagTone, string> = {
  dark: "bg-ink text-accent",
  sage: "bg-tint-sage text-ink",
  accent: "bg-accent text-ink",
};

/** Small non-interactive label: "Nouvelle récolte", a taste family, a limited edition. */
export function Tag({ tone = "dark", children }: { tone?: TagTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs leading-[1.125rem] font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
