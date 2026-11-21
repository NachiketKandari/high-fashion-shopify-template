#!/usr/bin/env node
/**
 * Registers the Shopify webhooks the storefront cache expects.
 *
 * Requires NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN and either SHOPIFY_ADMIN_ACCESS_TOKEN or
 * SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET. The app needs write_webhooks.
 *
 * Run:
 *   pnpm webhooks:register --dry-run
 *   pnpm webhooks:register --url=https://your-domain.example/api/webhooks/shopify
 *   pnpm webhooks:register
 *
 * The callback URL defaults to NEXT_PUBLIC_SITE_URL + /api/webhooks/shopify.
 */

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const version = process.env.SHOPIFY_API_VERSION ?? "2026-10";
const endpoint = `https://${domain}/admin/api/${version}/graphql.json`;

const TOPICS = [
  "PRODUCTS_CREATE",
  "PRODUCTS_UPDATE",
  "PRODUCTS_DELETE",
  "COLLECTIONS_CREATE",
  "COLLECTIONS_UPDATE",
  "COLLECTIONS_DELETE",
];

const args = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((arg) => arg.startsWith("--"))
    .map((arg) => {
      const [key, ...rest] = arg.slice(2).split("=");
      return [key, rest.length ? rest.join("=") : true];
    }),
);

const dryRun = Boolean(args["dry-run"]);
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
const callbackUrl =
  typeof args.url === "string" ? args.url : siteUrl ? `${siteUrl}/api/webhooks/shopify` : null;

let token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

async function getToken() {
  if (token) return token;
  const response = await fetch(`https://${domain}/admin/oauth/access_token`, {
    body: new URLSearchParams({
      client_id: process.env.SHOPIFY_CLIENT_ID,
      client_secret: process.env.SHOPIFY_CLIENT_SECRET,
      grant_type: "client_credentials",
    }),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "POST",
  });
  const payload = await response.json();
  if (!response.ok || !payload.access_token) {
    throw new Error(`Client credentials grant failed: ${JSON.stringify(payload)}`);
  }
  token = payload.access_token;
  return token;
}

async function admin(query, variables = {}, attempt = 0) {
  const accessToken = await getToken();
  const response = await fetch(endpoint, {
    body: JSON.stringify({ query, variables }),
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    method: "POST",
  });
  const payload = JSON.parse(await response.text());
  const throttled = payload.errors?.some(
    (error) => error.extensions?.code === "THROTTLED" || /throttled/i.test(error.message ?? ""),
  );
  if ((response.status === 429 || response.status >= 500 || throttled) && attempt < 5) {
    await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** attempt));
    return admin(query, variables, attempt + 1);
  }
  if (!response.ok || payload.errors) {
    throw new Error(
      `Admin API failed (${response.status}): ${JSON.stringify(payload.errors ?? payload)}`,
    );
  }
  return payload.data;
}

if (!domain) {
  console.error("Set NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN.");
  process.exit(1);
}

if (
  !dryRun &&
  !process.env.SHOPIFY_ADMIN_ACCESS_TOKEN &&
  !(process.env.SHOPIFY_CLIENT_ID && process.env.SHOPIFY_CLIENT_SECRET)
) {
  console.error("Set SHOPIFY_ADMIN_ACCESS_TOKEN or SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET.");
  process.exit(1);
}

if (!callbackUrl) {
  console.error("Pass --url=https://<domain>/api/webhooks/shopify or set NEXT_PUBLIC_SITE_URL.");
  process.exit(1);
}

const scopes = await admin(`query { currentAppInstallation { accessScopes { handle } } }`);
const handles = new Set(scopes.currentAppInstallation.accessScopes.map((scope) => scope.handle));
const canWrite = handles.has("write_webhooks");

const existing = await admin(`query {
  webhookSubscriptions(first: 100) {
    nodes {
      id
      topic
      endpoint {
        __typename
        ... on WebhookHttpEndpoint { callbackUrl }
      }
    }
  }
}`);

const matching = existing.webhookSubscriptions.nodes.filter(
  (subscription) =>
    subscription.endpoint?.__typename === "WebhookHttpEndpoint" &&
    subscription.endpoint.callbackUrl === callbackUrl,
);
const existingTopics = new Set(matching.map((subscription) => subscription.topic));
const missing = TOPICS.filter((topic) => !existingTopics.has(topic));

const report = {
  callbackUrl,
  canWriteWebhooks: canWrite,
  existing: matching.map((subscription) => ({ id: subscription.id, topic: subscription.topic })),
  missing,
  created: [],
  userErrors: [],
};

if (!canWrite) {
  report.userErrors.push(
    "Missing write_webhooks. Add it to the Dev Dashboard app, release the version, approve it on the store, then retry.",
  );
}

if (dryRun) {
  console.log(JSON.stringify({ dryRun: true, ...report }, null, 2));
  process.exit(canWrite ? 0 : 1);
}

if (!canWrite) {
  console.log(JSON.stringify({ dryRun: false, ...report }, null, 2));
  process.exit(1);
}

for (const topic of missing) {
  const result = await admin(
    `mutation($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
      webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
        webhookSubscription { id topic }
        userErrors { field message }
      }
    }`,
    { topic, webhookSubscription: { callbackUrl, format: "JSON" } },
  );
  const errors = result.webhookSubscriptionCreate.userErrors;
  if (errors.length) {
    report.userErrors.push(...errors);
  } else {
    report.created.push(result.webhookSubscriptionCreate.webhookSubscription);
  }
}

console.log(JSON.stringify({ dryRun: false, ...report }, null, 2));
process.exit(report.userErrors.length ? 1 : 0);
