import { readFileSync } from "node:fs";

import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

type Messages = { [key: string]: string | Messages };

const load = (locale: string) =>
  JSON.parse(readFileSync(`messages/${locale}.json`, "utf8")) as Messages;

/** Every leaf key of a message file, as dotted paths. */
function keysOf(messages: Messages, prefix = ""): string[] {
  return Object.entries(messages).flatMap(([key, value]) =>
    typeof value === "string" ? [`${prefix}${key}`] : keysOf(value, `${prefix}${key}.`),
  );
}

describe("message files", () => {
  const reference = keysOf(load("fr")).sort();

  it("has the same keys in English as in French, the reference language", () => {
    expect(keysOf(load("en")).sort()).toEqual(reference);
  });

  it.each(["fr", "en"])("has no empty message in %s", (locale) => {
    const messages = load(locale);
    const empty = keysOf(messages).filter((path) => {
      const value = path.split(".").reduce<string | Messages>((node, key) => {
        return typeof node === "string" ? node : (node[key] ?? "");
      }, messages);
      return typeof value !== "string" || value.trim() === "";
    });
    expect(empty).toEqual([]);
  });
});

describe("visible text", () => {
  const eslint = new ESLint();

  async function violations(filePath: string, code: string): Promise<string[]> {
    const [result] = await eslint.lintText(code, { filePath });
    return (result?.messages ?? [])
      .filter((message) => message.severity === 2)
      .map((message) => message.ruleId ?? "unknown");
  }

  it("rejects a literal text in JSX", async () => {
    const code = "export const Title = () => <h1>Boutique</h1>;\n";
    expect(await violations("src/features/catalogue/title.tsx", code)).toContain(
      "react/jsx-no-literals",
    );
  });

  it("accepts a translated text, the brand name and punctuation", async () => {
    const code =
      "export const Title = ({ t }: { t: (key: string) => string }) => (\n" +
      '  <h1 className="text-xl">\n    {t("title")} · <span>zolive</span>\n  </h1>\n);\n';
    expect(await violations("src/features/catalogue/title.tsx", code)).toEqual([]);
  });

  it("rejects a plain Next.js link, which would drop the language prefix", async () => {
    const code = 'import Link from "next/link";\nexport const x = Link;\n';
    expect(await violations("src/ui/menu.tsx", code)).toContain("no-restricted-imports");
  });
});
