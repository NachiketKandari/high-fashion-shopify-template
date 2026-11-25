import crypto from "node:crypto";

import { revalidateTag } from "next/cache";
import { z } from "zod";

import { getRequestId, withRequestId } from "@/lib/observability/request";
import { logError, logInfo, logWarn } from "@/lib/observability/server";

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;

const REVALIDATE_TAGS = z.array(z.string().min(1).max(256)).min(1).max(20);

function isAuthorized(header: string | null, secret: string): boolean {
  // Hashing both values gives timingSafeEqual the equal-length inputs it requires.
  const digest = (value: string) => crypto.createHash("sha256").update(value).digest();
  return crypto.timingSafeEqual(digest(header ?? ""), digest(`Bearer ${secret}`));
}

export async function POST(request: Request) {
  if (!REVALIDATE_SECRET) return new Response(null, { status: 404 });

  const requestId = getRequestId(request.headers);
  const respond = (response: Response) =>
    requestId ? withRequestId(response, requestId) : response;
  const start = performance.now();

  if (!isAuthorized(request.headers.get("authorization"), REVALIDATE_SECRET)) {
    logWarn("revalidate.unauthorized", { ...(requestId ? { requestId } : {}) });
    return respond(Response.json({ error: "Unauthorized" }, { status: 401 }));
  }

  const parsed = REVALIDATE_TAGS.safeParse(new URL(request.url).searchParams.getAll("tag"));
  if (!parsed.success) {
    logWarn("revalidate.tags.invalid", { ...(requestId ? { requestId } : {}) });
    return respond(Response.json({ error: "Pass 1 to 20 tag parameters" }, { status: 400 }));
  }

  const tags = [...new Set(parsed.data)];
  try {
    for (const tag of tags) revalidateTag(tag, { expire: 0 });
    logInfo("revalidate.completed", {
      durationMs: Math.round(performance.now() - start),
      ...(requestId ? { requestId } : {}),
      tags,
    });
    return respond(Response.json({ revalidated: tags }));
  } catch (error) {
    logError("revalidate.failed", error, {
      ...(requestId ? { requestId } : {}),
      tags,
    });
    return respond(new Response(null, { status: 500 }));
  }
}
