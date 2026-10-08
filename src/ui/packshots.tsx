import type { ReactNode } from "react";

/**
 * Drawn product visuals of the style guide. They are brand pictograms, not photographs:
 * flat shapes in the palette, rising from the bottom edge of a tinted block.
 * They are decorative: the product name is always written next to them.
 */

export type PackshotKind =
  "bottle" | "bottle-dark" | "tin" | "jar" | "jar-dark" | "vinegar" | "box";

type PackshotProps = {
  kind: PackshotKind;
  /** Short text printed on the label, in the serif italic. */
  label: string;
  /** Small capitals under the label, for example the volume. */
  detail?: string;
  className?: string;
};

type Frame = {
  viewBox: string;
  body: (props: Pick<PackshotProps, "label" | "detail">) => ReactNode;
};

const wordmark = "font-display font-semibold";
const italic = "font-serif italic";
const small = "font-sans font-semibold";

function bottle(glass: string, cap: string, labelFill: string, text: string, rule: string) {
  return function Bottle({ label, detail }: Pick<PackshotProps, "label" | "detail">) {
    return (
      <>
        <rect x="46" y="4" width="28" height="26" rx="5" className={cap} />
        <rect x="50" y="30" width="20" height="52" className={glass} />
        <path d="M50 80C50 106 22 108 22 140V320H98V140C98 108 70 106 70 80Z" className={glass} />
        <rect
          x="31"
          y="134"
          width="5"
          height="186"
          rx="2.5"
          className="fill-surface"
          opacity="0.14"
        />
        <rect x="22" y="172" width="76" height="98" className={labelFill} />
        <text
          x="60"
          y="210"
          textAnchor="middle"
          fontSize="19"
          letterSpacing="-0.8"
          className={`${wordmark} ${text}`}
        >
          zolive
        </text>
        <rect x="46" y="221" width="28" height="1" className={rule} />
        <text x="60" y="242" textAnchor="middle" fontSize="14" className={`${italic} ${text}`}>
          {label}
        </text>
        {detail ? (
          <text
            x="60"
            y="258"
            textAnchor="middle"
            fontSize="6.5"
            letterSpacing="1.2"
            className={`${small} ${text}`}
          >
            {detail}
          </text>
        ) : null}
      </>
    );
  };
}

function jar(glass: string, lid: string) {
  return function Jar({ label }: Pick<PackshotProps, "label" | "detail">) {
    return (
      <>
        <rect x="26" y="4" width="88" height="26" rx="6" className={lid} />
        <rect x="14" y="28" width="112" height="180" rx="20" className={glass} />
        <rect
          x="24"
          y="46"
          width="5"
          height="124"
          rx="2.5"
          className="fill-surface"
          opacity="0.12"
        />
        <rect x="14" y="74" width="112" height="66" className="fill-ground" />
        <text
          x="70"
          y="103"
          textAnchor="middle"
          fontSize="20"
          letterSpacing="-0.8"
          className={`${wordmark} fill-ink`}
        >
          zolive
        </text>
        <text x="70" y="124" textAnchor="middle" fontSize="14" className={`${italic} fill-ink`}>
          {label}
        </text>
      </>
    );
  };
}

const frames: Record<PackshotKind, Frame> = {
  bottle: {
    viewBox: "0 0 120 320",
    body: bottle("fill-brand", "fill-ink", "fill-ground", "fill-ink", "fill-ink"),
  },
  "bottle-dark": {
    viewBox: "0 0 120 320",
    body: bottle("fill-ink", "fill-brand", "fill-ground", "fill-ink", "fill-ink"),
  },
  jar: { viewBox: "0 0 140 170", body: jar("fill-brand", "fill-ink") },
  "jar-dark": { viewBox: "0 0 140 170", body: jar("fill-ink", "fill-brand") },
  tin: {
    viewBox: "0 0 170 240",
    body: ({ label, detail }) => (
      <>
        <rect x="108" y="4" width="30" height="24" rx="4" className="fill-brand" />
        <rect x="8" y="22" width="154" height="240" rx="12" className="fill-ink" />
        <rect
          x="18"
          y="36"
          width="5"
          height="204"
          rx="2.5"
          className="fill-surface"
          opacity="0.1"
        />
        <text
          x="85"
          y="120"
          textAnchor="middle"
          fontSize="36"
          letterSpacing="-1.8"
          className={`${wordmark} fill-accent`}
        >
          zolive
        </text>
        <rect x="65" y="136" width="40" height="1.5" className="fill-ground" />
        <text x="85" y="166" textAnchor="middle" fontSize="22" className={`${italic} fill-ground`}>
          {label}
        </text>
        {detail ? (
          <text
            x="85"
            y="190"
            textAnchor="middle"
            fontSize="9"
            letterSpacing="2"
            className={`${small} fill-on-brand-muted`}
          >
            {detail}
          </text>
        ) : null}
      </>
    ),
  },
  vinegar: {
    viewBox: "0 0 100 300",
    body: ({ label }) => (
      <>
        <rect x="38" y="4" width="24" height="22" rx="4" className="fill-brand" />
        <rect x="42" y="26" width="16" height="70" className="fill-ink" />
        <path
          d="M42 94C42 116 20 120 20 148V300H80V148C80 120 58 116 58 94Z"
          className="fill-ink"
        />
        <rect
          x="28"
          y="144"
          width="4"
          height="156"
          rx="2"
          className="fill-surface"
          opacity="0.12"
        />
        <rect x="20" y="178" width="60" height="84" className="fill-accent" />
        <text
          x="50"
          y="214"
          textAnchor="middle"
          fontSize="16"
          letterSpacing="-0.6"
          className={`${wordmark} fill-ink`}
        >
          zolive
        </text>
        <text x="50" y="236" textAnchor="middle" fontSize="13" className={`${italic} fill-ink`}>
          {label}
        </text>
      </>
    ),
  },
  box: {
    viewBox: "0 0 200 150",
    body: ({ label }) => (
      <>
        <rect x="8" y="40" width="184" height="130" className="fill-brand" />
        <rect x="0" y="16" width="200" height="38" rx="8" className="fill-ink" />
        <rect x="134" y="16" width="22" height="140" className="fill-accent" />
        <text
          x="70"
          y="108"
          textAnchor="middle"
          fontSize="26"
          letterSpacing="-1.2"
          className={`${wordmark} fill-ground`}
        >
          zolive
        </text>
        <text x="70" y="130" textAnchor="middle" fontSize="15" className={`${italic} fill-ground`}>
          {label}
        </text>
      </>
    ),
  },
};

/** Relative width of each visual inside a product card, so that they look the same size. */
const packshotWidth: Record<PackshotKind, string> = {
  bottle: "w-[38%]",
  "bottle-dark": "w-[38%]",
  tin: "w-[52%]",
  jar: "w-[50%]",
  "jar-dark": "w-[50%]",
  vinegar: "w-[29%]",
  box: "w-[70%]",
};

export function Packshot({ kind, label, detail, className }: PackshotProps) {
  const frame = frames[kind];
  return (
    <svg
      viewBox={frame.viewBox}
      aria-hidden="true"
      focusable="false"
      className={`block h-auto flex-none ${className ?? packshotWidth[kind]}`}
    >
      {frame.body({ label, detail })}
    </svg>
  );
}
