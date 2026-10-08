import { describe, expect, it } from "vitest";

import { ARGON2_PARAMETERS, hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("uses Argon2id with the minimum parameters recommended by OWASP", async () => {
    expect(ARGON2_PARAMETERS).toEqual({ memoryCost: 19456, timeCost: 2, parallelism: 1 });
    expect(await hashPassword("olive-verte-2026")).toMatch(/^\$argon2id\$v=19\$m=19456,t=2,p=1\$/);
  });

  it("gives a different hash each time, thanks to a random salt", async () => {
    const [first, second] = await Promise.all([
      hashPassword("olive-verte-2026"),
      hashPassword("olive-verte-2026"),
    ]);
    expect(first).not.toBe(second);
  });

  it("accepts the right password and refuses a wrong one", async () => {
    const hash = await hashPassword("olive-verte-2026");

    expect(await verifyPassword({ hash, password: "olive-verte-2026" })).toBe(true);
    expect(await verifyPassword({ hash, password: "olive-verte-2027" })).toBe(false);
  });

  it("refuses, without throwing, a stored value that is not a hash", async () => {
    expect(await verifyPassword({ hash: "not-a-hash", password: "olive-verte-2026" })).toBe(false);
    expect(await verifyPassword({ hash: "", password: "" })).toBe(false);
  });
});
