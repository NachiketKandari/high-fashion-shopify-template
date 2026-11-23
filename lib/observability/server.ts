import { getPathname, isRequestId, REQUEST_ID_HEADER } from "@/lib/observability";

const DEBUG_SHOPIFY = ["1", "true"].includes(process.env.DEBUG_SHOPIFY?.toLowerCase() ?? "");

const SENSITIVE_KEY = /(authorization|cookie|password|secret|session|token|email|address)/i;

const CONSOLE_METHODS = {
  debug: "debug",
  error: "error",
  info: "info",
  warn: "warn",
} as const;

const LEVEL_WEIGHT = {
  debug: 0,
  error: 3,
  info: 1,
  warn: 2,
} as const;

const MAX_DEPTH = 4;

const MAX_ITEMS = 20;

const MAX_KEYS = 50;

const MAX_STACK_LENGTH = 8_000;

const MAX_STRING_LENGTH = 2_000;

type ConsoleLevel = keyof typeof CONSOLE_METHODS;

export type LogLevel = keyof typeof LEVEL_WEIGHT;

export interface SerializedError {
  cause?: unknown;
  code?: string;
  digest?: string;
  message: string;
  name?: string;
  requestId?: string;
  retryAfter?: string;
  stack?: string;
  status?: number;
}

type LogFields = Record<string, unknown>;

type RequestErrorContext = {
  renderSource?: string;
  renderType?: string;
  revalidateReason?: "on-demand" | "stale" | undefined;
  routePath: string;
  routeType: string;
  routerKind: string;
};

type RequestErrorRequest = {
  headers: Record<string, string | string[] | undefined>;
  method: string;
  path: string;
};

function getLogLevel(): LogLevel {
  const value = process.env.LOG_LEVEL?.toLowerCase();
  if (value === "debug" || value === "info" || value === "warn" || value === "error") return value;
  // DEBUG_SHOPIFY retains its historic meaning: Shopify timing/debug entries are visible without LOG_LEVEL.
  return DEBUG_SHOPIFY ? "debug" : "info";
}

function truncate(value: string, maxLength: number): string {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;
}

function sanitizeValue(value: unknown, depth = 0): unknown {
  if (depth > MAX_DEPTH) return "[omitted]";

  if (value === null) return null;

  if (Array.isArray(value)) {
    return value.slice(0, MAX_ITEMS).map((item) => sanitizeValue(item, depth + 1));
  }

  if (value instanceof Date) return value.toISOString();

  if (value instanceof Error) return serializeError(value);

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !SENSITIVE_KEY.test(key))
      .slice(0, MAX_KEYS);
    return Object.fromEntries(
      entries.map(([key, entry]) => [key, sanitizeValue(entry, depth + 1)]),
    );
  }

  if (typeof value === "string") return truncate(value, MAX_STRING_LENGTH);

  if (typeof value === "bigint") return value.toString();

  if (typeof value === "number" && !Number.isFinite(value)) return String(value);

  return value;
}

export function serializeError(value: unknown): SerializedError {
  if (!(value instanceof Error)) {
    return { message: truncate(String(value), MAX_STRING_LENGTH) };
  }

  const record = value as Error & {
    code?: unknown;
    digest?: unknown;
    requestId?: unknown;
    retryAfter?: unknown;
    status?: unknown;
  };

  const digest = typeof record.digest === "string" ? truncate(record.digest, 200) : undefined;
  const code = typeof record.code === "string" ? truncate(record.code, 200) : undefined;
  const requestId =
    typeof record.requestId === "string" ? truncate(record.requestId, 128) : undefined;
  const retryAfter =
    typeof record.retryAfter === "string" ? truncate(record.retryAfter, 200) : undefined;
  const status =
    typeof record.status === "number" && Number.isFinite(record.status) ? record.status : undefined;

  return {
    ...(code !== undefined && { code }),
    ...(digest !== undefined && { digest }),
    ...(record.cause !== undefined && { cause: sanitizeValue(record.cause) }),
    message: truncate(record.message, MAX_STRING_LENGTH),
    ...(record.name && { name: record.name }),
    ...(requestId !== undefined && { requestId }),
    ...(retryAfter !== undefined && { retryAfter }),
    ...(record.stack && { stack: truncate(record.stack, MAX_STACK_LENGTH) }),
    ...(status !== undefined && { status }),
  };
}

function emit(level: LogLevel, event: string, fields: LogFields) {
  if (LEVEL_WEIGHT[level] < LEVEL_WEIGHT[getLogLevel()]) return;

  const timestamp = new Date(performance.timeOrigin + performance.now()).toISOString();
  const sanitized = sanitizeValue(fields, 0);
  const base =
    typeof sanitized === "object" && sanitized !== null && !Array.isArray(sanitized)
      ? (sanitized as Record<string, unknown>)
      : {};
  const line = JSON.stringify({
    ...base,
    environment: process.env.VERCEL_ENV ?? "local",
    event,
    level,
    service: "storefront",
    timestamp,
  });
  console[CONSOLE_METHODS[level] satisfies ConsoleLevel](line);
}

export function logDebug(event: string, fields: LogFields = {}) {
  emit("debug", event, fields);
}

export function logInfo(event: string, fields: LogFields = {}) {
  emit("info", event, fields);
}

export function logWarn(event: string, fields: LogFields = {}) {
  emit("warn", event, fields);
}

export function logError(event: string, error: unknown, fields: LogFields = {}) {
  emit("error", event, { ...fields, error: serializeError(error) });
}

export function reportRequestError(
  error: unknown,
  request: RequestErrorRequest,
  context: RequestErrorContext,
): void {
  const header = request.headers[REQUEST_ID_HEADER];
  const requestId = isRequestId(Array.isArray(header) ? header[0] : header)
    ? (header as string)
    : undefined;

  logError("request.error", error, {
    ...(context.renderSource ? { renderSource: context.renderSource } : {}),
    ...(context.renderType ? { renderType: context.renderType } : {}),
    ...(context.revalidateReason ? { revalidateReason: context.revalidateReason } : {}),
    ...(requestId ? { requestId } : {}),
    method: request.method,
    path: getPathname(request.path),
    routePath: context.routePath,
    routeType: context.routeType,
    routerKind: context.routerKind,
  });
}
