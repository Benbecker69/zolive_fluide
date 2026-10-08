import { getHealth } from "@/features/health/get-health";

// The status depends on the database at the time of the request: never cache it.
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const health = await getHealth();
  return Response.json(health, {
    status: health.status === "ok" ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
