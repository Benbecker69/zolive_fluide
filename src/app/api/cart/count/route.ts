import { getCartCount } from "@/features/cart/get-cart";

// The answer depends on the visitor's cookie: never cache it.
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  return Response.json(
    { count: await getCartCount() },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
