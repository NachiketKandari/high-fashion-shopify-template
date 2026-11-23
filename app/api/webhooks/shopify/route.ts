import crypto from "node:crypto";

import { revalidateTag } from "next/cache";

import { getRequestId, withRequestId } from "@/lib/observability/request";
import { logError, logInfo, logWarn } from "@/lib/observability/server";
import { getNumericShopifyId } from "@/lib/shopify/id/server";
import {
  claimWebhookDelivery,
  completeWebhookDelivery,
  releaseWebhookDelivery,
} from "@/lib/webhooks/server";

const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET;

function verifyWebhook(body: string, hmacHeader: string | null, secret: string): boolean {
  if (!hmacHeader) return false;

  const expected = crypto.createHmac("sha256", secret).update(body, "utf8").digest();
  const received = Buffer.from(hmacHeader, "base64");

  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}

class InvalidWebhookPayloadError extends Error {}

function productTags(topic: string, body: string): string[] {
  const tags: string[] = [];

  // Product tags cascade through every surface without purging the full catalog.
  if (topic === "products/create" || topic === "products/delete") {
    tags.push("products-index");
  }

  try {
    const payload = JSON.parse(body);
    if (payload.handle) {
      tags.push(`product-${payload.handle}`);
      tags.push(`recommendations-${payload.handle}`);
    }
    if (payload.admin_graphql_api_id) {
      const numericId = getNumericShopifyId(payload.admin_graphql_api_id);
      if (numericId) {
        tags.push(`product-${numericId}`);
      }
    } else if (payload.id) {
      tags.push(`product-${payload.id}`);
    }
  } catch (error) {
    throw new InvalidWebhookPayloadError("Could not parse products payload", { cause: error });
  }

  return tags;
}

function collectionTags(topic: string, body: string): string[] {
  const tags: string[] = [];

  // Create/delete also invalidate the collection index; the broad tag is break-glass only.
  if (topic === "collections/create" || topic === "collections/delete") {
    tags.push("collections-index");
  }

  try {
    const payload = JSON.parse(body);
    if (payload.handle) {
      tags.push(`collection-${payload.handle}`);
    }
    if (payload.admin_graphql_api_id) {
      const numericId = getNumericShopifyId(payload.admin_graphql_api_id);
      if (numericId) {
        tags.push(`collection-${numericId}`);
      }
    } else if (payload.id) {
      tags.push(`collection-${payload.id}`);
    }
  } catch (error) {
    throw new InvalidWebhookPayloadError("Could not parse collections payload", { cause: error });
  }

  return tags;
}

function metaobjectTags(body: string): string[] {
  const tags = ["metaobjects"];

  // Metaobjects are low-cardinality, so fire the broad tag too (unlike catalog) — aggregate reads refresh without per-type index tags.
  try {
    const payload = JSON.parse(body);
    if (payload.handle) {
      tags.push(`metaobject-${payload.handle}`);
    }
  } catch (error) {
    throw new InvalidWebhookPayloadError("Could not parse metaobjects payload", { cause: error });
  }

  return tags;
}

export async function POST(request: Request) {
  if (!SHOPIFY_WEBHOOK_SECRET) return new Response(null, { status: 404 });

  const requestId = getRequestId(request.headers);
  const respond = (response: Response) =>
    requestId ? withRequestId(response, requestId) : response;

  const body = await request.text();
  const start = performance.now();
  const deliveryId = request.headers.get("x-shopify-webhook-id") ?? "";
  const shopDomain = request.headers.get("x-shopify-shop-domain") ?? undefined;
  const apiVersion = request.headers.get("x-shopify-api-version") ?? undefined;
  const triggeredAt = request.headers.get("x-shopify-triggered-at") ?? undefined;
  const topic = request.headers.get("x-shopify-topic");
  const delivery = {
    ...(apiVersion ? { apiVersion } : {}),
    ...(deliveryId ? { deliveryId } : {}),
    ...(requestId ? { requestId } : {}),
    ...(shopDomain ? { shopDomain } : {}),
    ...(triggeredAt ? { triggeredAt } : {}),
    topic,
  };

  if (!verifyWebhook(body, request.headers.get("x-shopify-hmac-sha256"), SHOPIFY_WEBHOOK_SECRET)) {
    logWarn("webhook.signature.invalid", delivery);
    return respond(Response.json({ error: "Invalid signature" }, { status: 401 }));
  }

  if (!topic) {
    logWarn("webhook.topic.missing", delivery);
    return respond(Response.json({ error: "Missing topic header" }, { status: 400 }));
  }

  const claim = await claimWebhookDelivery(deliveryId);
  if (claim.state === "completed" || claim.state === "processing") {
    logInfo("webhook.delivery.duplicate", {
      ...delivery,
      idempotencyState: claim.state,
    });
    return respond(Response.json({ duplicate: true, success: true, tagsInvalidated: [], topic }));
  }

  try {
    const tagsInvalidated: string[] = [];

    if (topic.startsWith("products/")) {
      tagsInvalidated.push(...productTags(topic, body));
    }

    if (topic.startsWith("collections/")) {
      tagsInvalidated.push(...collectionTags(topic, body));
    }

    if (topic.startsWith("metaobjects/")) {
      tagsInvalidated.push(...metaobjectTags(body));
    }

    for (const tag of tagsInvalidated) revalidateTag(tag, { expire: 0 });

    await completeWebhookDelivery(claim);
    logInfo("webhook.delivery.completed", {
      ...delivery,
      durationMs: Math.round(performance.now() - start),
      idempotencyState: claim.state,
      tagsInvalidated,
    });
    return respond(Response.json({ success: true, tagsInvalidated, topic }));
  } catch (error) {
    await releaseWebhookDelivery(claim);

    if (error instanceof InvalidWebhookPayloadError) {
      logError("webhook.payload.invalid", error, delivery);
      return respond(Response.json({ success: true, tagsInvalidated: [], topic }));
    }

    logError("webhook.invalidation.failed", error, delivery);
    return respond(new Response(null, { status: 500 }));
  }
}
