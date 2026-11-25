import { ensureRequestId, withRequestId } from "@/lib/observability/request";

export async function GET(request: Request) {
  const { requestId } = ensureRequestId(request);

  return withRequestId(
    Response.json(
      {
        environment: process.env.VERCEL_ENV ?? "local",
        service: "storefront",
        status: "ok",
      },
      { headers: { "Cache-Control": "no-store" } },
    ),
    requestId,
  );
}
