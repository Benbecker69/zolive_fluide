import { Link } from "@/i18n/navigation";
import type { ReactNode } from "react";

type NavItem = { href: string; label: string; current?: boolean };

/** Olive mark and wordmark. The link carries the accessible name; the drawing is decorative. */
function Logo({ href, label, small = false }: { href: string; label: string; small?: boolean }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={`flex h-11 items-center gap-2 font-display leading-none font-semibold tracking-[-0.055em] hover:opacity-80 ${small ? "text-[1.625rem]" : "text-3xl"}`}
    >
      <svg
        width={small ? 22 : 26}
        height={small ? 22 : 26}
        viewBox="0 0 26 26"
        aria-hidden="true"
        focusable="false"
      >
        <ellipse
          cx="11.5"
          cy="15"
          rx="7"
          ry="9"
          transform="rotate(-24 11.5 15)"
          className="fill-brand"
        />
        <path
          d="M15 7.5C15.5 4 18.5 1.8 23 2c.2 4-2.4 6.6-7 6.4Z"
          className="fill-accent stroke-ink"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
      <span>zolive</span>
    </Link>
  );
}

/** First focusable element of the page: lets keyboard users jump over the header. */
export function SkipLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-10 focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:font-semibold focus:text-ground"
    >
      {children}
    </a>
  );
}

/** Full-width strip above the header for the message of the moment. */
export function AnnouncementBar({ children }: { children: ReactNode }) {
  return (
    <p className="bg-brand px-5 py-2.5 text-center text-[0.8125rem] leading-5 font-medium tracking-[0.02em] text-ground">
      {children}
    </p>
  );
}

/** Cart entry of the header: a pill with the number of items. */
export function CartLink({ href, label, count }: { href: string; label: string; count: number }) {
  return (
    <Link
      href={href}
      className="ml-2 flex h-11 items-center gap-2.5 rounded-full bg-ink pr-3 pl-4.5 text-sm font-semibold text-ground hover:opacity-80"
    >
      <span>{label}</span>
      <span className="flex size-6 items-center justify-center rounded-full bg-accent text-xs text-ink">
        {count}
      </span>
    </Link>
  );
}

type SiteHeaderProps = {
  logo: { href: string; label: string };
  nav?: { label: string; items: NavItem[] };
  /** Controls on the right: search, account, cart, language switch. */
  actions?: ReactNode;
};

export function SiteHeader({ logo, nav, actions }: SiteHeaderProps) {
  return (
    <header className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-x-8 gap-y-2 px-5 py-5 sm:px-8 lg:px-12">
      <Logo {...logo} />
      {nav ? (
        <nav aria-label={nav.label}>
          <ul className="flex flex-wrap items-center gap-x-9 text-[0.9375rem] font-medium">
            {nav.items.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  aria-current={item.current ? "page" : undefined}
                  className={`flex min-h-11 items-center hover:opacity-80 ${item.current ? "border-b-2 border-ink font-semibold" : ""}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
      {actions ? <div className="flex items-center gap-1">{actions}</div> : null}
    </header>
  );
}

type SiteFooterProps = {
  logo: { href: string; label: string };
  nav?: { label: string; items: NavItem[] };
  /** Legal line, for example "© 2026 Zolive". */
  notice: string;
};

export function SiteFooter({ logo, nav, notice }: SiteFooterProps) {
  return (
    <footer className="mx-auto max-w-page px-5 pt-26 pb-10 sm:px-8 lg:px-12">
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-t border-line pt-7">
        <Logo {...logo} small />
        {nav ? (
          <nav aria-label={nav.label}>
            <ul className="flex flex-wrap gap-x-7 text-sm">
              {nav.items.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="flex min-h-11 items-center hover:opacity-80">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
        <p className="text-[0.8125rem] text-muted">{notice}</p>
      </div>
    </footer>
  );
}
