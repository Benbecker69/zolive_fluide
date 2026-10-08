import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

/** Proves that a literal colour in the code is rejected by the linter (ADR 0006). */
const eslint = new ESLint();

async function violations(filePath: string, code: string): Promise<string[]> {
  const [result] = await eslint.lintText(code, { filePath });
  return (result?.messages ?? [])
    .filter((message) => message.severity === 2)
    .map((message) => message.ruleId ?? "unknown");
}

describe("design tokens", () => {
  it.each([
    ['export const className = "bg-[#ff0000]";'],
    ['export const style = { color: "#1d4a35" };'],
    ['export const style = { color: "rgb(29, 74, 53)" };'],
    ["export const className = `text-[#fff] ${1}`;"],
  ])("rejects the literal colour in %s", async (code) => {
    expect(await violations("src/features/cart/summary.tsx", `${code}\n`)).toContain(
      "no-restricted-syntax",
    );
  });

  it.each([
    ['export const className = "bg-tint-sage text-ink";'],
    ['export const anchor = "#moulin";'],
    ['export const label = "Commande n° 42";'],
  ])("accepts %s", async (code) => {
    expect(await violations("src/features/cart/summary.tsx", `${code}\n`)).toEqual([]);
  });
});
