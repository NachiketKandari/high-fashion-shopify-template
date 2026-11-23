import { shopifyLogger } from "@/lib/shopify/logging/server";

interface AdminGraphqlResponse<T> {
  data?: T;
  errors?: Array<{ message: string; extensions?: { code?: string } }>;
}

interface CachedToken {
  expiresAt: number;
  token: string;
}

let cachedToken: CachedToken | null = null;

function getDomain(): string | null {
  return process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ?? null;
}

async function getAccessToken(): Promise<string | null> {
  const staticToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  if (staticToken) return staticToken;

  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
  const domain = getDomain();
  if (!clientId || !clientSecret || !domain) return null;

  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.token;

  const response = await fetch(`https://${domain}/admin/oauth/access_token`, {
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
    cache: "no-store",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "POST",
  });
  if (!response.ok) return null;

  const payload = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
  };
  if (!payload.access_token) return null;

  cachedToken = {
    expiresAt: Date.now() + (payload.expires_in ?? 86_400) * 1000,
    token: payload.access_token,
  };
  return cachedToken.token;
}

export async function adminGraphql<T>(
  query: string,
  variables: Record<string, unknown> = {},
  attempt = 0,
): Promise<T | null> {
  const domain = getDomain();
  if (!domain) return null;
  const accessToken = await getAccessToken();
  if (!accessToken) return null;

  const version = process.env.SHOPIFY_API_VERSION ?? "2026-10";
  const response = await fetch(`https://${domain}/admin/api/${version}/graphql.json`, {
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    method: "POST",
  });

  const payload = (await response.json().catch(() => null)) as AdminGraphqlResponse<T> | null;
  const throttled =
    payload?.errors?.some(
      (error) => error.extensions?.code === "THROTTLED" || /throttled/i.test(error.message ?? ""),
    ) ?? false;

  if ((response.status === 429 || response.status >= 500 || throttled) && attempt < 3) {
    await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
    return adminGraphql<T>(query, variables, attempt + 1);
  }

  if (!response.ok || !payload || payload.errors?.length) {
    shopifyLogger.warn("Admin API request failed", {
      errors: payload?.errors,
      scope: "admin",
      status: response.status,
    });
    return null;
  }

  return payload.data ?? null;
}
