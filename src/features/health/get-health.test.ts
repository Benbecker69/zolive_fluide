import { describe, expect, it, vi } from "vitest";

import { pingDatabase } from "@/data/health";

import { getHealth } from "./get-health";

vi.mock("@/data/health", () => ({ pingDatabase: vi.fn() }));

describe("getHealth", () => {
  it("is ok when the database answers", async () => {
    vi.mocked(pingDatabase).mockResolvedValue(true);

    expect(await getHealth()).toEqual({ status: "ok", checks: { app: "ok", database: "ok" } });
  });

  it("is down when the database does not answer", async () => {
    vi.mocked(pingDatabase).mockResolvedValue(false);

    expect(await getHealth()).toEqual({ status: "down", checks: { app: "ok", database: "down" } });
  });
});
