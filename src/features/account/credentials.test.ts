import { describe, expect, it } from "vitest";

import { invalidFields, signInSchema, signUpSchema } from "./credentials";

const valid = {
  name: "Camille Martin",
  email: "camille@example.org",
  password: "olive-verte-2026",
};

describe("signUpSchema", () => {
  it("accepts a name, an e-mail and a password of twelve characters or more", () => {
    expect(signUpSchema.safeParse(valid).success).toBe(true);
    expect(signUpSchema.safeParse({ ...valid, password: "a".repeat(12) }).success).toBe(true);
  });

  it("normalizes the e-mail and trims the name", () => {
    const parsed = signUpSchema.parse({
      ...valid,
      name: "  Camille  ",
      email: "  Camille@Example.ORG ",
    });
    expect(parsed).toMatchObject({ name: "Camille", email: "camille@example.org" });
  });

  it("does not touch the password: spaces are part of it", () => {
    expect(signUpSchema.parse({ ...valid, password: "  twelve chars  " }).password).toBe(
      "  twelve chars  ",
    );
  });

  it.each([
    ["a password of eleven characters", { password: "a".repeat(11) }, ["password"]],
    ["a password longer than the maximum", { password: "a".repeat(129) }, ["password"]],
    ["an e-mail without a domain", { email: "camille@" }, ["email"]],
    ["an empty name", { name: "   " }, ["name"]],
    ["a name that is too long", { name: "a".repeat(81) }, ["name"]],
  ])("refuses %s", (_, change, fields) => {
    const result = signUpSchema.safeParse({ ...valid, ...change });
    expect(result.success).toBe(false);
    if (!result.success) expect(invalidFields(result.error)).toEqual(fields);
  });

  it("reports every invalid field at once", () => {
    const result = signUpSchema.safeParse({ name: "", email: "nope", password: "short" });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(invalidFields(result.error).sort()).toEqual(["email", "name", "password"]);
  });

  it("accepts a long passphrase without digits or symbols", () => {
    expect(signUpSchema.safeParse({ ...valid, password: "quatre mots sans chiffre" }).success).toBe(
      true,
    );
  });
});

describe("signInSchema", () => {
  it("accepts any non-empty password, so that sign-in never reveals the rule", () => {
    expect(signInSchema.safeParse({ email: valid.email, password: "x" }).success).toBe(true);
  });

  it("refuses an empty password and a malformed e-mail", () => {
    expect(signInSchema.safeParse({ email: valid.email, password: "" }).success).toBe(false);
    expect(signInSchema.safeParse({ email: "nope", password: "x" }).success).toBe(false);
  });
});
