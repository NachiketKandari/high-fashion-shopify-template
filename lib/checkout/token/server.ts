import { createHmac, timingSafeEqual } from "node:crypto";

const TOKEN_VERSION = "v1";

function getSecret(): string | null {
  return process.env.CHECKOUT_CONFIRMATION_SECRET ?? process.env.SHOPIFY_ADMIN_ACCESS_TOKEN ?? null;
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(`${TOKEN_VERSION}.${payload}`).digest("base64url");
}

export function createConfirmationToken(orderId: string): string | null {
  if (!orderId.startsWith("gid://shopify/Order/")) return null;
  const secret = getSecret();
  if (!secret) return null;
  const payload = Buffer.from(orderId, "utf8").toString("base64url");
  return `${TOKEN_VERSION}.${payload}.${sign(payload, secret)}`;
}

export function readConfirmationToken(token: string): string | null {
  const secret = getSecret();
  if (!secret) return null;

  const [version, payload, signature] = token.split(".");
  if (version !== TOKEN_VERSION || !payload || !signature) return null;

  const expected = sign(payload, secret);
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== signatureBuffer.length) return null;
  if (!timingSafeEqual(expectedBuffer, signatureBuffer)) return null;

  const orderId = Buffer.from(payload, "base64url").toString("utf8");
  return orderId.startsWith("gid://shopify/Order/") ? orderId : null;
}
