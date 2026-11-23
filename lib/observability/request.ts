import { getPathname, REQUEST_ID_HEADER, isRequestId } from "@/lib/observability";

interface RequestIdHeaders {
  get(name: string): string | null;
}

export function getRequestId(headers: RequestIdHeaders): string | undefined {
  const value = headers.get(REQUEST_ID_HEADER);
  return isRequestId(value) ? value : undefined;
}

export function getRequestIdValue(
  headers: Record<string, string | string[] | undefined>,
): string | undefined {
  const value = headers[REQUEST_ID_HEADER];
  return isRequestId(Array.isArray(value) ? value[0] : value) ? (value as string) : undefined;
}

// Proxy and route handlers are request-time code, so a cryptographic ID is available here.
export function ensureRequestId(request: Request): {
  headers: Headers;
  requestId: string;
} {
  const headers = new Headers(request.headers);
  const requestId = getRequestId(headers) ?? crypto.randomUUID();
  headers.set(REQUEST_ID_HEADER, requestId);
  return { headers, requestId };
}

export function withRequestId(response: Response, requestId: string): Response {
  response.headers.set(REQUEST_ID_HEADER, requestId);
  return response;
}

export function getRequestPath(request: Request): string {
  return getPathname(request.url);
}
