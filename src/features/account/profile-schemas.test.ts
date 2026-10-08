import { describe, expect, it } from "vitest";

import { addressSchema, invalidAddressFields, nameSchema, safeNextPath } from "./profile-schemas";

const valid = {
  recipient: "Camille Martin",
  line1: "12 rue des Oliviers",
  line2: "",
  postalCode: "13100",
  city: "Aix-en-Provence",
};

describe("addressSchema", () => {
  it("accepts a complete address and turns an empty second line into null", () => {
    expect(addressSchema.parse(valid)).toEqual({ ...valid, line2: null });
  });

  it("keeps a second line when there is one, and trims every field", () => {
    const parsed = addressSchema.parse({ ...valid, line2: "  Bâtiment B ", city: " Aix " });
    expect(parsed).toMatchObject({ line2: "Bâtiment B", city: "Aix" });
  });

  it.each([
    ["a postal code of four digits", { postalCode: "1310" }, ["postalCode"]],
    ["a postal code with letters", { postalCode: "13A00" }, ["postalCode"]],
    ["an empty street", { line1: "  " }, ["line1"]],
    ["an empty recipient", { recipient: "" }, ["recipient"]],
    ["a city that is too long", { city: "a".repeat(81) }, ["city"]],
    ["a second line that is too long", { line2: "a".repeat(121) }, ["line2"]],
  ])("refuses %s", (_, change, fields) => {
    const result = addressSchema.safeParse({ ...valid, ...change });
    expect(result.success).toBe(false);
    if (!result.success) expect(invalidAddressFields(result.error)).toEqual(fields);
  });

  it("reports every invalid field at once", () => {
    const result = addressSchema.safeParse({
      recipient: "",
      line1: "",
      line2: "",
      postalCode: "",
      city: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(invalidAddressFields(result.error).sort()).toEqual([
        "city",
        "line1",
        "postalCode",
        "recipient",
      ]);
    }
  });
});

describe("nameSchema", () => {
  it("trims the name and refuses an empty one", () => {
    expect(nameSchema.parse({ name: "  Camille " })).toEqual({ name: "Camille" });
    expect(nameSchema.safeParse({ name: "   " }).success).toBe(false);
  });
});

describe("safeNextPath", () => {
  it.each(["/compte", "/panier", "/commande/adresse"])("keeps the site path %s", (path) => {
    expect(safeNextPath(path)).toBe(path);
  });

  it.each([
    ["another site", "https://evil.example/compte"],
    ["a protocol-relative address", "//evil.example"],
    ["a path with a backslash", "/\\evil.example"],
    ["a path with a query string", "/compte?x=1"],
    ["a path going up", "/../admin"],
    ["a script address", "javascript:alert(1)"],
    ["an empty value", ""],
    ["a missing value", undefined],
    ["a repeated parameter", ["/compte", "/panier"]],
  ])("falls back to the account page for %s", (_, value) => {
    expect(safeNextPath(value)).toBe("/compte");
  });
});
