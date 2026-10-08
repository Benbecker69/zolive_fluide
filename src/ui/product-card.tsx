import { Link } from "@/i18n/navigation";
import type { ReactNode } from "react";

import { Tag } from "./chip";
import { Packshot, type PackshotKind } from "./packshots";

type Tint = "sage" | "zest" | "sky" | "peach";

const tintClass: Record<Tint, string> = {
  sage: "bg-tint-sage",
  zest: "bg-tint-zest",
  sky: "bg-tint-sky",
  peach: "bg-tint-peach",
};

type ProductCardProps = {
  /** Product page; without it the name is plain text. */
  href?: string;
  name: string;
  /** Second line: variety and format, for example "Picholine · 50 cl". */
  detail: string;
  /** Price already formatted for the locale. */
  price: string;
  tint: Tint;
  packshot: { kind: PackshotKind; label: string; detail?: string };
  /** Optional label over the visual, for example "Nouvelle récolte". */
  tag?: string;
  /** Optional control placed over the visual, for example an add-to-cart button. */
  action?: ReactNode;
};

/**
 * Product tile of the listing and of the "favourites" rows. The name is the link:
 * the visual is decorative and the whole tile stays one tab stop, plus the optional action.
 */
export function ProductCard({
  href,
  name,
  detail,
  price,
  tint,
  packshot,
  tag,
  action,
}: ProductCardProps) {
  return (
    <article className="flex flex-col gap-4">
      <div className="relative">
        <div
          className={`flex aspect-[4/5] items-end justify-center overflow-hidden rounded-card ${tintClass[tint]}`}
        >
          <Packshot {...packshot} />
        </div>
        {tag ? (
          <span className="absolute top-4 left-4">
            <Tag>{tag}</Tag>
          </span>
        ) : null}
        {action ? <div className="absolute right-3.5 bottom-3.5">{action}</div> : null}
      </div>
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-xl leading-tight tracking-[-0.02em]">
            {href ? (
              <Link href={href} className="hover:opacity-80">
                {name}
              </Link>
            ) : (
              name
            )}
          </h3>
          <span className="text-sm text-muted">{detail}</span>
        </div>
        <span className="text-[1.0625rem] font-semibold whitespace-nowrap">{price}</span>
      </div>
    </article>
  );
}
