import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * `.node-version` is the single place where the Node.js version is declared.
 * Every other file that needs it must agree with it.
 */
const declared = readFileSync(".node-version", "utf8").trim();

describe("Node.js version", () => {
  it("is declared as a major version in .node-version", () => {
    expect(declared).toMatch(/^\d+$/);
  });

  it("matches the engines field of package.json", () => {
    const manifest = JSON.parse(readFileSync("package.json", "utf8")) as {
      engines: { node: string };
    };
    expect(manifest.engines.node).toBe(`${declared}.x`);
  });

  it("matches the running Node.js", () => {
    expect(process.versions.node.split(".")[0]).toBe(declared);
  });
});
