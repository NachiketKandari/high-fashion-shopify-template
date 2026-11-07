# Observability

The storefront has Shopify-specific transport logging and opt-in product analytics. It does not have
application-wide error reporting, request correlation, a health check, or production RUM enabled by
default. On a normal Vercel deployment, the platform's function and build logs are the only
always-on backend telemetry.

## Current coverage

| Signal                  | Current state                                                                                                                                                                             | Always on                               |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Shopify API errors      | GraphQL partial errors are warned; Storefront failures throw with `{ errors, operation }`.                                                                                                | Yes                                     |
| Shopify API timings     | Storefront, Customer Account and MCP transports log `durationMs` and `operation`.                                                                                                         | No — only when `DEBUG_SHOPIFY=1`/`true` |
| Application exceptions  | Uncaught server errors reach the platform log; client errors are not reported anywhere.                                                                                                   | Server: platform only. Client: no.      |
| Error boundaries        | Root, account and global boundaries render a retry surface. They do not log or report the error.                                                                                          | UI yes, reporting no                    |
| Request correlation     | None. Shopify request IDs are deliberately blanked; no request ID is generated or propagated.                                                                                             | No                                      |
| Webhook deliveries      | Invalid signatures and payload parse failures are logged. Successful deliveries and invalidations are not.                                                                                | Failures only                           |
| Cache invalidation      | `revalidateTag` calls and results are not logged.                                                                                                                                         | No                                      |
| Product analytics       | GA4 or GTM when configured by env; Vercel Analytics, Speed Insights and Shopify analytics are opt-in and off by default.                                                                  | Only GA4/GTM when env vars are set      |
| RUM / Web Vitals        | Speed Insights when enabled; no `useReportWebVitals` or custom metric reporting.                                                                                                          | No                                      |
| Storefront health check | No `/api/health` or `/status` route. Eve exposes `/eve/v1/health` only when the agent is enabled.                                                                                         | No                                      |
| Agent telemetry         | When the Vercel project has Agent Runs and trace sampling enabled, Eve records sessions, model calls and tool calls there. The app emits no custom OpenTelemetry or Agent Runs telemetry. | Platform only, and only when Eve is on  |

## Logging

Hydrogen's logger is configured once at startup in `instrumentation.ts`, through
`configureShopifyLogging()` in `lib/shopify/logging/server.ts`. Output is prefixed console text such
as `[shopify:warn:storefront]`, followed by the error and a context object. It is not JSON and has no
timestamp, environment or request ID.

- `DEBUG_SHOPIFY=1` or `true` selects the `debug` level; otherwise the level is `info`.
- `logShopifyDebug()` gates the Storefront, Customer Account and MCP timing logs.
- `lib/shopify/errors/server.ts` warns on partial Storefront GraphQL errors and throws on transient
  errors (`THROTTLED`, `INTERNAL_SERVER_ERROR`) or a response with no data.
- `lib/shopify/customer-account/server.ts` warns on partial Customer Account errors and throws when
  there is no data.
- The only other runtime `console.*` calls are webhook failures in
  `app/api/webhooks/shopify/route.ts` and one customer Server Action failure in
  `lib/customer/action.ts`.

There is no generic application logger, log-level configuration beyond `DEBUG_SHOPIFY`, or log
drain. Uncaught server exceptions are visible in Vercel's function logs with the platform's own
request metadata.

## Error reporting

`app/error.tsx`, `app/global-error.tsx` and `app/account/(authenticated)/error.tsx` render
`ErrorBoundaryContent`. Each receives an `error` prop with an optional `digest`, but none logs,
captures or forwards it.

There is no Sentry, OpenTelemetry, Rollbar or equivalent dependency. `instrumentation.ts` exports
`register()` only; it does not export `onRequestError`, and there is no `instrumentation-client.ts`.
Client-side exceptions therefore disappear after the retry UI is shown. Product, collection, blog,
page, policy, cart and search segments rely on the root boundary.

Several server paths degrade silently, which is reasonable for rendering but leaves no trace:
`withFallback` in `lib/shopify/errors/server.ts`, session decryption failures in
`lib/auth/request.ts`, Markdown route data failures, the `/llms.txt` collection and policy
fallbacks, and the `503` returned when `app/api/agent/session` cannot prepare a cart.

## Analytics

- GA4 loads when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set. GTM loads when `NEXT_PUBLIC_GTM_ID` is set
  and takes precedence, because the GA4 page view is expected to come from the container.
- Vercel Analytics and Speed Insights are wired in `components/analytics/index.tsx` but default to
  `false` in `lib/config/index.ts`.
- Shopify analytics, consent and WebMCP are opt-in through `shopConfig.analytics.shopify` and
  `shopConfig.shopify.webmcp`. When enabled, `components/analytics/shopify-client.tsx` mounts
  `ShopifyScripts` and the Hydrogen analytics bus.
- `components/analytics/trackers.tsx` publishes `PAGE_VIEWED`, `PRODUCT_VIEWED`, `COLLECTION_VIEWED`,
  `SEARCH_VIEWED` and `CART_VIEWED`. The tracker components mount regardless of the Shopify script
  flags, but they no-op until `ShopifyScripts` has mounted the Hydrogen analytics bus. No custom
  Vercel events, GTM `dataLayer` pushes or server-side conversion events are implemented.
- `lib/analytics/client.ts` exposes `addAnalyticsDestination()`, but no destination is registered.

## Webhooks and cache invalidation

`app/api/webhooks/shopify/route.ts` verifies the HMAC and returns the invalidated tags. It logs only
invalid signatures and payload parse failures. It does not read or log the Shopify webhook ID, shop
domain, API version or retry headers, and it does not log successful deliveries, durations or
`revalidateTag` results. A payload parse failure still returns `200`, so Shopify does not retry it.

`app/api/revalidate/route.ts` has no audit log for unauthorized attempts, invalid tags or successful
invalidations. Neither route has app-level idempotency, queueing or dead-letter handling.

## Health

There is no storefront health endpoint. `/eve/v1/health` exists only when `shopConfig.agent.isEnabled`
is true; it reports whether the Eve runtime is ready, not whether Shopify or the storefront is
healthy. `/agent/ucp-profile.json` returns `404` when the agent is disabled.

## Recommended order

1. **Add error reporting.** Sentry or an OpenTelemetry exporter, an `onRequestError` export in
   `instrumentation.ts`, and capture from the three error boundaries. Include the digest, route and
   request ID. This is the largest gap: today a production exception has no owner, count or alert.
2. **Add request correlation.** Generate or forward a request ID in `proxy.ts`, attach it to Shopify
   requests instead of blanking `x-request-id`, and include it in logs and error responses. Replace
   the deliberate empty header only with an equivalent that avoids Hydrogen's synchronous UUID
   fallback.
3. **Introduce a structured logger.** Wrap the existing console calls in a JSON logger with level,
   timestamp, environment, request ID, route, operation and error fields, controlled by `LOG_LEVEL`.
   Keep the Hydrogen logger adapter so SDK logs use it too.
4. **Add a storefront health route.** A lightweight `/api/health` that reports process readiness and,
   optionally, a cached Shopify reachability check. Point an uptime monitor at it.
5. **Make webhooks observable.** Log delivery ID, topic, shop domain, duration, tags invalidated and
   failure reason; alert on repeated signature or parse failures. Decide whether parse failures
   should return a retryable status, and add idempotency if duplicate deliveries matter.
6. **Enable production RUM.** Turn on Speed Insights and Vercel Analytics in `shopConfig`, or move
   Web Vitals into an existing error/analytics pipeline. A disabled Speed Insights switch means no
   Core Web Vitals field data.
7. **Add agent telemetry.** Use Eve's Agent Runs and OpenTelemetry traces, and surface token usage,
   tool latency and server-safe error IDs. Keep cart IDs and customer data out of logs.

## Operating it today

```sh
DEBUG_SHOPIFY=1 pnpm dev   # Shopify transport timings and debug logs
pnpm build                 # platform build logs
curl https://<domain>/eve/v1/health   # only when the agent is enabled
```

Logs must never contain Storefront or Customer Account tokens, customer session cookies, customer
email or address data, or the Client secret used by the catalog seeder. Shopify HTML is sanitized
before rendering, but it is not a logging boundary.
