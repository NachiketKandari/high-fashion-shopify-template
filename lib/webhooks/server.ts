import { z } from "zod";

import { logWarn, serializeError } from "@/lib/observability/server";

const PROCESSING_TTL_SECONDS = 5 * 60;

const COMPLETED_TTL_SECONDS = 24 * 60 * 60;

const CLAIM_PREFIX = "webhook-delivery:";

type WebhookDeliveryState = "claimed" | "completed" | "disabled" | "processing" | "unavailable";

export interface WebhookDeliveryClaim {
  deliveryId: string;
  state: WebhookDeliveryState;
}

const redisResult = z.object({
  error: z.string().optional(),
  result: z.unknown().optional(),
});

const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;

function redisUrl(base: string, command: string, value?: string): string {
  const url = new URL(command, base.endsWith("/") ? base : `${base}/`);
  if (value !== undefined) url.pathname += `/${value}`;
  return url.toString();
}

async function readRedis(command: string): Promise<Response> {
  const response = await fetch(redisUrl(UPSTASH_REDIS_REST_URL as string, command), {
    headers: { authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}` },
    method: "GET",
    signal: AbortSignal.timeout(2_000),
  });
  if (!response.ok) throw new Error(`Redis REST returned ${response.status}`);
  return response;
}

async function writeRedis(command: string, value?: string): Promise<Response> {
  const response = await fetch(redisUrl(UPSTASH_REDIS_REST_URL as string, command, value), {
    headers: { authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}` },
    method: "POST",
    signal: AbortSignal.timeout(2_000),
  });
  if (!response.ok) throw new Error(`Redis REST returned ${response.status}`);
  return response;
}

function isRedisConfigured(): boolean {
  return Boolean(UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN);
}

async function readClaim(deliveryId: string): Promise<string | undefined> {
  const response = await readRedis(`get/${CLAIM_PREFIX}${deliveryId}`);
  const parsed = redisResult.safeParse(await response.json());
  const value = parsed.success ? parsed.data.result : undefined;
  return typeof value === "string" ? value : undefined;
}

export async function claimWebhookDelivery(deliveryId: string): Promise<WebhookDeliveryClaim> {
  if (!deliveryId || !isRedisConfigured()) return { deliveryId, state: "disabled" };

  try {
    const existing = await readClaim(deliveryId);
    if (existing === "completed") return { deliveryId, state: "completed" };
    if (existing !== undefined) return { deliveryId, state: "processing" };

    const response = await writeRedis(
      `set/${CLAIM_PREFIX}${deliveryId}?EX=${PROCESSING_TTL_SECONDS}&NX`,
      "processing",
    );
    const parsed = redisResult.safeParse(await response.json());
    const claimed = parsed.success && parsed.data.result === "OK";
    return { deliveryId, state: claimed ? "claimed" : "processing" };
  } catch (error) {
    // Availability beats idempotency: an unreachable Redis still lets the webhook refresh its tags.
    logWarn("webhook.idempotency.unavailable", {
      deliveryId,
      error: serializeError(error),
    });
    return { deliveryId, state: "unavailable" };
  }
}

export async function completeWebhookDelivery(claim: WebhookDeliveryClaim): Promise<void> {
  if (claim.state !== "claimed") return;

  try {
    await writeRedis(
      `set/${CLAIM_PREFIX}${claim.deliveryId}?EX=${COMPLETED_TTL_SECONDS}`,
      "completed",
    );
  } catch (error) {
    logWarn("webhook.idempotency.complete-failed", {
      deliveryId: claim.deliveryId,
      error: serializeError(error),
    });
  }
}

export async function releaseWebhookDelivery(claim: WebhookDeliveryClaim): Promise<void> {
  if (claim.state !== "claimed") return;

  try {
    await writeRedis(`del/${CLAIM_PREFIX}${claim.deliveryId}`);
  } catch (error) {
    logWarn("webhook.idempotency.release-failed", {
      deliveryId: claim.deliveryId,
      error: serializeError(error),
    });
  }
}
