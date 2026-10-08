import { pingDatabase } from "@/data/health";

type CheckStatus = "ok" | "down";

export type Health = {
  status: CheckStatus;
  checks: { app: CheckStatus; database: CheckStatus };
};

/** Overall status of the application: it is "ok" only when every dependency answers. */
export async function getHealth(): Promise<Health> {
  const database: CheckStatus = (await pingDatabase()) ? "ok" : "down";
  return {
    status: database === "ok" ? "ok" : "down",
    checks: { app: "ok", database },
  };
}
