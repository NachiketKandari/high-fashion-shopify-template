# Observability

The storefront logs operational telemetry as structured JSON and reports server and client errors
with request IDs. It does not add product analytics events, third-party error-reporting SDKs, or a
telemetry dependency. On Vercel, function logs consume the JSON stream, and a log drain retains
and alerts on it; see "Log retention and alerting" below for the chosen route.

This is operational telemetry only. GA4/GTM, Vercel Analytics, Speed Insights, Shopify analytics
and the app event bus remain owned by `components/analytics/**` and `lib/analytics/**`; the
observability layer emits no commerce or page-view events.

## Coverage

| Signal                 | Current state                                                                                                                                                                           | Always on          |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| Server exceptions      | Next's `onRequestError` reports them as `request.error` with method, path, route and digest.                                                                                            | Yes                |
| Client exceptions      | Root, global and account error boundaries report to `/api/client-errors` as `client.error` with name, message, digest and path.                                                         | Yes                |
| Degraded Shopify reads | `withFallback` reports `storefront.read.fallback` with the operation; Cache Components' expected shell-abort digest is not logged as an error.                                          | Yes                |
| Request IDs            | Every proxied HTML/RSC/route response carries `x-request-id`; proxy-generated UUIDs, validated inbound IDs for upstream callers, and operation IDs for cached/background Shopify calls. | Yes                |
| Shopify API timings    | Storefront, Customer Account and MCP transports log `durationMs`, `operation` and `requestId` when `DEBUG_SHOPIFY=1`/`true`.                                                            | Only when debug    |
| Shopify partial errors | Storefront and Customer Account partial GraphQL errors are warnings with the operation and request ID.                                                                                  | Yes                |
| Silent server failures | Auth session decrypt failures, Markdown and `llms.txt` fallbacks, agent cart preparation, cart buyer sync and customer mutations report a named error.                                  | Yes                |
| Webhook deliveries     | Signature, topic, parse, invalidation and completed outcomes are logged with delivery ID, shop domain, API version, duration, request ID and tags.                                      | When secret is set |
| Webhook idempotency    | Redis REST claims are 24-hour completed-delivery records and 5-minute processing claims. Unset Redis is `disabled`, not an error.                                                       | Optional           |
| Manual invalidation    | `/api/revalidate` logs unauthorized, invalid-tag, completed and failed outcomes with duration and tags.                                                                                 | When secret is set |
| Health                 | `/api/health` reports process readiness and environment with `Cache-Control: no-store` and `x-request-id`.                                                                              | Yes                |
| Cache invalidation     | `revalidateTag` calls are summarized through webhook/revalidate logs, not logged per tag.                                                                                               | Through outcomes   |
| Product analytics      | Owned by `components/analytics/**`; not emitted by this layer.                                                                                                                          | No                 |
| RUM / Web Vitals       | Speed Insights remains opt-in; no custom `useReportWebVitals`.                                                                                                                          | No                 |
| Error persistence      | Vercel function logs plus a log drain to Axiom (Grafana Cloud Loki is the alternative). No error-reporting SDK; `lib/observability/**` stays the seam if one is ever added.             | Platform + drain   |

## Request IDs

`proxy.ts` accepts an inbound `x-request-id` only when it matches
`^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$`; otherwise it generates a UUID. It sets the ID on the
upstream request and stamps every direct response, including Shopify handler responses, rewrites
and errors. `/api/client-errors`, `/api/revalidate`, `/api/webhooks/shopify` and `/api/health`
stamp it too.

Hydrogen uses the same ID as `Custom-Storefront-Request-Group-ID` for request-scoped Shopify calls.
Cached catalog reads and other background reads create process-local operation IDs (for example
`storefront-…`) through `createOperationId` instead of a request-time UUID, so Cache Components can
keep the static shell and cached outputs. The Storefront, Customer Account and MCP transports also
send that ID as Shopify's `x-request-id` and include it in their timing logs.

No headers, cookies, query strings or Shopify payloads are logged. Paths are pathname-only.

## Logging

`lib/observability/server.ts` writes one JSON object per line through `console.debug/info/warn/
error`: `timestamp`, `level`, `service: "storefront"`, `environment` (`VERCEL_ENV`, otherwise
`local`), `event`, then sanitized fields. `LOG_LEVEL` selects the minimum level and defaults to
`info`. `DEBUG_SHOPIFY` makes those Shopify timing/debug entries visible even when `LOG_LEVEL` is
unset.

Error fields are shaped by `serializeError`: name, truncated message, digest, stack, status,
request ID, retry-after, code and a sanitized cause. Object fields are depth- and item-limited, and
keys matching authorization, cookie, password, secret, session, token, email or address are
dropped. Never pass a full request, cookie jar or Shopify response into a logger.

Hydrogen's logger remains installed through `lib/shopify/logging/server.ts`, so SDK entries use the
same JSON stream. `DEBUG_SHOPIFY` makes those Shopify timing entries visible without `LOG_LEVEL`,
preserving its historic behavior.

## Error reporting

- `instrumentation.ts` exports `onRequestError` and reports `request.error` for render, route,
  action and proxy failures.
- `components/error/error-reporter.tsx` sends each client error boundary report once to
  `POST /api/client-errors`. The endpoint is same-origin only, accepts a strict, size-limited JSON
  shape, and logs `client.error`; it does not trust stack traces or arbitrary fields.
- `lib/customer/action.ts`, `lib/cart/request.ts`, auth session decryption, Markdown routes,
  `/llms.txt` and `/api/agent/session` report their previously silent failures.
- Degraded reads report through `withFallback(promise, fallback, operation)`.

Retention and alerting come from the log drain in "Log retention and alerting" below. If an
error-reporting product is later chosen, `lib/observability/**` is the replacement seam; do not
add a second reporter beside the drain.

## Webhooks and idempotency

The webhook handler verifies the HMAC, claims the delivery ID, invalidates tags, and marks the
delivery complete. `X-Shopify-Webhook-Id` is deduplicated for 24 hours when
`UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set. A claimed delivery that fails
invalidation is released so Shopify's retry can run; concurrent duplicate deliveries return `200`
with `duplicate: true` and no tags. Redis unavailability degrades to `disabled` and processes the
delivery anyway; availability beats deduplication.

Every outcome is logged, including signature failures, missing topics, parse failures (which still
return `200` because Shopify does not retry malformed payloads), invalidation failures and
completed deliveries.

## Health

`GET /api/health` returns `{"service":"storefront","status":"ok","environment":…}` with
`Cache-Control: no-store` and `x-request-id`. It performs no Shopify request, so it reports process
readiness only. Point uptime monitoring at it; a Shopify reachability check is deliberately
absent until a monitor needs it.

## Log retention and alerting

The production route is a **Vercel log drain to Axiom**; Grafana Cloud Loki is the equivalent
alternative. This is dashboard configuration only: the JSON stream from `lib/observability/**`
stays the interface, the repository gains no vendor SDK, credentials or CI step, and switching
vendors later means changing the drain, not the code. Vercel log drains require the Pro plan.

Pending setup (dashboard work; nothing left to change in this repository):

- [ ] Confirm the Vercel project is on Pro; log drains are a Pro feature.
- [ ] Create an Axiom dataset (for example `storefront-prod`) and copy its ingest endpoint.
- [ ] Vercel → Settings → Log Drains: add a drain targeting that endpoint.
- [ ] Probe a known event (a signed webhook delivery or a forced server error) and confirm the
      dataset receives it.
- [ ] Alert on `level == "error"` events, at minimum `request.error`, `client.error`,
      `webhook.invalidation.failed` and `revalidate.failed`.
- [ ] Alert separately on `webhook.idempotency.unavailable` (and any `webhook.idempotency.*`
      warning): these mean deliveries processed without deduplication, not data loss.
- [ ] Point an uptime monitor at `GET /api/health`.

If grouped error triage is ever needed — real error volume, a support team — wire Sentry through
`lib/observability/**` and fold `/api/client-errors` into it; never run a second reporter beside
the drain.

## Operating it today

```sh
DEBUG_SHOPIFY=1 LOG_LEVEL=debug pnpm dev  # Shopify transport timings and degraded-read logs
DEBUG_SHOPIFY=1 pnpm dev                  # Shopify timings without other debug entries
pnpm build                                # platform build logs
curl -i https://<domain>/api/health       # readiness, request ID and no-store
```

Logs must never contain Storefront or Customer Account tokens, customer session cookies, customer
email or address data, or the Client secret used by the catalog seeder. Shopify HTML is sanitized
before rendering, but it is not a logging boundary.
