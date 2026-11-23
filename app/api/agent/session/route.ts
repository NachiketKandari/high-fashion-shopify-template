import { createCartCookie } from "@shopify/hydrogen";

import { createCustomerRequestContext, createCustomerSessionManager } from "@/lib/auth/request";
import { createEmptyCart, getCartById, getCartIdFromCookie } from "@/lib/cart/server";
import { shopConfig } from "@/lib/config";
import { getRequestId, withRequestId } from "@/lib/observability/request";
import { logError } from "@/lib/observability/server";

export async function POST(request: Request) {
  if (!shopConfig.agent.isEnabled) return new Response(null, { status: 404 });
  if (
    request.headers.get("origin") !== new URL(request.url).origin ||
    request.headers.get("sec-fetch-site") === "cross-site"
  )
    return new Response(null, { status: 403 });
  const requestId = getRequestId(request.headers);
  const requestContext = createCustomerRequestContext(request);
  const sessionManager = shopConfig.auth.isEnabled
    ? createCustomerSessionManager(request)
    : undefined;
  let response: Response;
  try {
    let cartId = await getCartIdFromCookie();
    if (!cartId || !(await getCartById(cartId)))
      cartId = await createEmptyCart(requestContext, sessionManager);
    response = new Response(null, {
      headers: { "Cache-Control": "private, no-store" },
      status: 204,
    });
    response.headers.append("Set-Cookie", createCartCookie(cartId));
  } catch (error) {
    logError("agent.session.cart-prepare-failed", error, {
      ...(requestId ? { requestId } : {}),
    });
    response = Response.json(
      { error: "Could not prepare your cart. Please try again." },
      { status: 503 },
    );
  }
  const sessionHeaders = await sessionManager?.commit?.();
  if (sessionHeaders)
    for (const cookie of new Headers(sessionHeaders).getSetCookie())
      response.headers.append("Set-Cookie", cookie);
  requestContext.applyResponseHeaders(response.headers);
  return requestId ? withRequestId(response, requestId) : response;
}
