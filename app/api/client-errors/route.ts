import { z } from "zod";

import { ensureRequestId, withRequestId } from "@/lib/observability/request";
import { logError } from "@/lib/observability/server";

const MAX_BODY_LENGTH = 16_000;

const CLIENT_ERROR = z.strictObject({
  digest: z.string().max(200).optional(),
  message: z.string().min(1).max(2000),
  name: z.string().max(200).optional(),
  path: z
    .string()
    .max(500)
    .refine((value) => value.startsWith("/") && !value.startsWith("//"))
    .optional(),
});

export async function POST(request: Request) {
  const { requestId } = ensureRequestId(request);

  if (request.headers.get("sec-fetch-site") === "cross-site") {
    return withRequestId(new Response(null, { status: 403 }), requestId);
  }

  const body = await request.text();
  if (!body || body.length > MAX_BODY_LENGTH) {
    return withRequestId(new Response(null, { status: 400 }), requestId);
  }

  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return withRequestId(new Response(null, { status: 400 }), requestId);
  }

  const parsed = CLIENT_ERROR.safeParse(payload);
  if (!parsed.success) {
    return withRequestId(new Response(null, { status: 400 }), requestId);
  }

  const error = new Error(parsed.data.message);
  if (parsed.data.name) error.name = parsed.data.name;
  logError("client.error", error, {
    ...(parsed.data.digest ? { digest: parsed.data.digest } : {}),
    ...(parsed.data.path ? { path: parsed.data.path } : {}),
    requestId,
  });

  return withRequestId(new Response(null, { status: 204 }), requestId);
}
