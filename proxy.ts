import { getCartId, handleShopifyRoutes } from "@shopify/hydrogen";
import {
  createCustomerAccountServerHandlers,
  CUSTOMER_ACCOUNT_AUTHORIZE_PATH,
  CUSTOMER_ACCOUNT_LOGIN_PATH,
  CUSTOMER_ACCOUNT_LOGOUT_PATH,
  CUSTOMER_ACCOUNT_REFRESH_PATH,
} from "@shopify/hydrogen/customer-account";
import { NextResponse, NextRequest } from "next/server";

import {
  createCustomerRequestContext,
  createCustomerSessionManager,
  forwardCustomerRefreshAttempt,
  getCustomerRequestOrigin,
  getHydrogenCustomerSession,
} from "@/lib/auth/request";
import {
  cartHandlers,
  createCustomerCartHandlers,
  syncCartBuyerIdentity,
} from "@/lib/cart/request";
import { getRefinedCollectionPath, isRefinedCollectionPath } from "@/lib/collections";
import { shopConfig } from "@/lib/config";
import { getMarkdownRewritePath } from "@/lib/markdown/representation";
import { ensureRequestId, withRequestId } from "@/lib/observability/request";
import { predictiveSearchHandlers } from "@/lib/search/request";
import { SHOPIFY_ROUTE_TEMPLATES } from "@/lib/shopify/routing";
import { createRequestStorefrontClient } from "@/lib/shopify/storefront/server";

const AUTH_PATHS = new Set<string>([
  CUSTOMER_ACCOUNT_AUTHORIZE_PATH,
  CUSTOMER_ACCOUNT_LOGIN_PATH,
  CUSTOMER_ACCOUNT_LOGOUT_PATH,
  CUSTOMER_ACCOUNT_REFRESH_PATH,
]);

export async function proxy(request: NextRequest): Promise<Response> {
  const { headers: requestHeaders, requestId } = ensureRequestId(request);
  const proxiedRequest = new NextRequest(request, { headers: requestHeaders });
  const pathname = proxiedRequest.nextUrl.pathname;
  const requestContext = createCustomerRequestContext(proxiedRequest);
  const isAuthPath = shopConfig.auth.isEnabled && AUTH_PATHS.has(pathname);
  const customerSession =
    isAuthPath || (shopConfig.auth.isEnabled && pathname === "/api/cart")
      ? await getHydrogenCustomerSession()
      : undefined;

  const routeOptions = {
    request: proxiedRequest,
    requestContext,
    routeTemplates: SHOPIFY_ROUTE_TEMPLATES,
    storefrontClient: createRequestStorefrontClient(requestContext),
  };
  if (pathname === "/api/cart" && proxiedRequest.method === "POST") {
    const cartId = getCartId({ cookie: proxiedRequest.headers.get("cookie") ?? undefined });
    if (cartId) await syncCartBuyerIdentity(routeOptions.storefrontClient, cartId);
  }
  const shopifyRoute = await (customerSession
    ? handleShopifyRoutes({
        ...routeOptions,
        handlers: customerHandlers(customerSession, isAuthPath),
        sessionManager: createCustomerSessionManager(proxiedRequest),
      })
    : handleShopifyRoutes({ ...routeOptions, handlers: [cartHandlers, predictiveSearchHandlers] }));
  if (shopifyRoute) return withRequestId(shopifyRoute, requestId);
  if (isRefinedCollectionPath(pathname)) {
    return withRequestId(new Response("Not Found", { status: 404 }), requestId);
  }

  const headers = requestContext.getForwardedRequestHeaders();
  const rewritePath =
    getMarkdownRewritePath(proxiedRequest) ??
    getRefinedCollectionPath(pathname, proxiedRequest.nextUrl.search);
  const response = rewritePath
    ? NextResponse.rewrite(new URL(`${rewritePath}${proxiedRequest.nextUrl.search}`, request.url), {
        request: { headers },
      })
    : NextResponse.next({
        request: { headers: forwardCustomerRefreshAttempt(proxiedRequest.nextUrl, headers) },
      });
  requestContext.applyResponseHeaders(response.headers);
  return withRequestId(response, requestId);
}

function customerHandlers(
  customerSession: Awaited<ReturnType<typeof getHydrogenCustomerSession>>,
  isAuthPath: boolean,
) {
  const cart = createCustomerCartHandlers(customerSession);
  if (!isAuthPath) return [cart, predictiveSearchHandlers];

  const auth = createCustomerAccountServerHandlers({
    cartServerHandlers: cart,
    customerSession,
    defaultPostLoginRedirectPathname: "/account",
    loginFailedRedirectPath: "/account/sign-in-failed",
    origin: getCustomerRequestOrigin,
    postLogoutRedirectUri: "/",
  });
  return [auth, cart, predictiveSearchHandlers];
}

export const config = {
  matcher: [
    // Only named static and metadata files skip the proxy: Shopify's dotted routes and `.md` mirrors must still match.
    "/((?!_next/static|_next/image|_next/data|_vercel|eve(?:/|$)|_eve_internal(?:/|$)|agent/ucp-profile\\.json$|apple-icon\\.png$|favicon\\.ico$|icon\\.svg$|icons/|llms\\.txt$|manifest\\.webmanifest$|og-default\\.png$|robots\\.txt$|sitemap\\.xml$|sitemap/).*)",
  ],
};
