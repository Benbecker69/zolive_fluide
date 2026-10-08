import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

/**
 * Proves that the layer rules of ADR 0002 are enforced by the linter:
 * each case lints a virtual file placed in a layer and checks the verdict.
 */
const eslint = new ESLint();

async function violations(filePath: string, code: string): Promise<string[]> {
  const [result] = await eslint.lintText(code, { filePath });
  return (result?.messages ?? [])
    .filter((message) => message.severity === 2)
    .map((message) => message.ruleId ?? "unknown");
}

const importFrom = (source: string) =>
  `import { thing } from "${source}";\nexport const x = thing;\n`;

describe("layer boundaries", () => {
  it.each([
    ["src/ui/button.ts", "@/data/orders"],
    ["src/ui/button.ts", "@/features/cart/total"],
    ["src/lib/money.ts", "@/ui/button"],
    ["src/data/orders.ts", "@/features/cart/total"],
    ["src/features/cart/total.ts", "@/app/page"],
    ["src/app/page.tsx", "@/data/orders"],
    ["src/app/page.tsx", "../data/orders"],
  ])("rejects %s importing %s", async (filePath, source) => {
    expect(await violations(filePath, importFrom(source))).toContain("no-restricted-imports");
  });

  it.each([
    ["src/app/page.tsx", "@/features/cart/total"],
    ["src/app/page.tsx", "@/ui/button"],
    ["src/features/cart/total.ts", "@/data/orders"],
    ["src/features/cart/total.ts", "@/lib/money"],
    ["src/data/orders.ts", "@/lib/money"],
    ["src/ui/button.ts", "@/lib/money"],
  ])("accepts %s importing %s", async (filePath, source) => {
    expect(await violations(filePath, importFrom(source))).toEqual([]);
  });

  it("rejects a database import outside the data layer", async () => {
    expect(await violations("src/features/cart/total.ts", importFrom("drizzle-orm"))).toContain(
      "no-restricted-imports",
    );
  });

  it("accepts a database import inside the data layer", async () => {
    expect(await violations("src/data/orders.ts", importFrom("drizzle-orm"))).toEqual([]);
  });

  it("rejects reading the environment outside the data layer", async () => {
    const code = "export const url = process.env.DATABASE_URL;\n";
    expect(await violations("src/features/cart/total.ts", code)).toContain(
      "no-restricted-properties",
    );
    expect(await violations("src/data/config.ts", code)).toEqual([]);
  });
});
