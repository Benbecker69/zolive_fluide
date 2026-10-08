import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

/**
 * Layer boundaries (docs/adr/0002-nextjs-modular-monolith.md).
 * Each layer lists the only layers it may import; everything else is an error.
 */
const LAYERS = {
  app: ["features", "ui"],
  features: ["data", "ui", "lib"],
  data: ["lib"],
  ui: ["lib"],
  lib: [],
};

/** Packages that talk to the database: only the data layer may import them. */
const DATABASE_PACKAGES = ["drizzle-orm", "drizzle-orm/*", "pg", "postgres"];

function boundariesFor(layer) {
  const forbiddenLayers = Object.keys(LAYERS).filter(
    (other) => other !== layer && !LAYERS[layer].includes(other),
  );
  const patterns = forbiddenLayers.map((other) => ({
    group: [`@/${other}`, `@/${other}/**`, `**/${other}/**`],
    message: `The "${layer}" layer must not import from "${other}" (see ADR 0002).`,
  }));
  if (layer !== "data") {
    patterns.push({
      group: DATABASE_PACKAGES,
      message: "Only the data layer talks to the database (see ADR 0002).",
    });
  }

  const rules = { "no-restricted-imports": ["error", { patterns }] };
  if (layer !== "data") {
    rules["no-restricted-properties"] = [
      "error",
      {
        object: "process",
        property: "env",
        message: "Only the data layer reads the environment (see ADR 0002).",
      },
    ];
  }
  return { files: [`src/${layer}/**/*.{ts,tsx}`], rules };
}

/**
 * Design tokens (docs/adr/0006-tailwind-design-tokens.md): colours come from the theme.
 * A literal colour in the code is an error; the theme itself lives in globals.css.
 */
const COLOUR_LITERAL = String.raw`/#[0-9a-fA-F]{3,8}\b|\b(rgb|rgba|hsl|hsla|oklch|oklab)\(/`;
const designTokens = {
  files: ["src/**/*.{ts,tsx}"],
  ignores: ["src/**/*.test.{ts,tsx}"],
  rules: {
    "no-restricted-syntax": [
      "error",
      {
        selector: `Literal[value=${COLOUR_LITERAL}]`,
        message: "Use a colour token of the theme instead of a literal colour (see ADR 0006).",
      },
      {
        selector: `TemplateElement[value.raw=${COLOUR_LITERAL}]`,
        message: "Use a colour token of the theme instead of a literal colour (see ADR 0006).",
      },
    ],
  },
};

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  ...Object.keys(LAYERS).map(boundariesFor),
  designTokens,
  prettier,
  globalIgnores([
    ".next/**",
    "coverage/**",
    "design/mockup/**",
    "next-env.d.ts",
    "playwright-report/**",
    "test-results/**",
  ]),
]);
